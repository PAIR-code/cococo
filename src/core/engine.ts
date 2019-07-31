/* Copyright 2019 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import * as mm from '@magenta/music';
import { observable } from 'mobx';
import { Note, NoteSequence } from './note';
import editor from './editor';
import sequences from './sequences';
import { range } from 'lodash';
import * as Tone from 'tone';
import { trim, fromMagentaSequence } from './magenta-utils';

import {
  DEFAULT_BPM,
  MIN_PITCH,
  MAX_PITCH,
  NOTE_VELOCITY,
  SOUNDFONT_URL,
  MODEL_URL,
  TOTAL_SIXTEENTHS,
} from './constants';

interface InfillMask {
  step: number;
  voice: number;
}

export class CallbackObject extends mm.BasePlayerCallback {
  constructor(private engine: Engine) {
    super();
  }

  run(note: mm.NoteSequence.INote, t: number) {
    const { pitch, quantizedStartStep } = note;

    // this offsets the position by loopStart, so that the notes correspond to the notes in the notesMap
    // which allows the notes to be highlighted red for playing
    editor.setNotePlaying(pitch, quantizedStartStep + this.engine.loopStart);
  }
  stop() {
    if (this.engine.shouldLoop) {
      this.engine.loop();
    } else {
      this.engine.stop();
    }
  }
}

function delay(ms = 1) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

class Engine {
  playerCallbackObject = new CallbackObject(this);
  @observable isPlayerLoaded = false;
  @observable isModelLoaded = false;
  @observable isPlaying = false;
  @observable isWorking = false;

  @observable shouldLoop = true;

  @observable loopStart = 0;
  @observable loopEnd = TOTAL_SIXTEENTHS;

  player = new mm.SoundFontPlayer(
    SOUNDFONT_URL,
    Tone.master,
    undefined,
    undefined,
    this.playerCallbackObject
  );
  model = new mm.Coconet(MODEL_URL);

  @observable bpm = DEFAULT_BPM;

  constructor() {
    this.loadPlayer();
    this.loadModel();
  }

  async loadPlayer() {
    const allNotes: mm.NoteSequence.INote[] = range(
      MIN_PITCH,
      MAX_PITCH + 1
    ).map(pitch => ({
      pitch,
      velocity: NOTE_VELOCITY,
    }));
    const allNotesSeq = { notes: allNotes };
    await this.player.loadSamples(allNotesSeq);
    this.isPlayerLoaded = true;
  }

  async loadModel() {
    await this.model.initialize();
    this.isModelLoaded = true;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  playNote(note: Note) {
    if (this.isPlayerLoaded) {
      this.playNoteDown(note);
      const timePerSixteenth = (((1 / this.bpm) * 60) / 4) * 1000;
      const delay = note.duration * timePerSixteenth;
      setTimeout(() => this.playNoteUp(note), delay);
    }
  }

  playNoteDown(note: Note) {
    if (this.isPlayerLoaded) {
      editor.activeNoteValue = note.pitch;
      this.player.playNoteDown(note.magentaNote);
    }
  }

  playNoteUp(note: Note) {
    if (this.isPlayerLoaded) {
      editor.activeNoteValue = null;
      this.player.playNoteUp(note.magentaNote);
    }
  }

  getMagentaNoteSequence(notes: Note[], merge = false) {
    const noteSequence = {
      notes: notes.map(note => note.magentaNote),
      tempos: [{ time: 0, qpm: this.bpm }],
      totalQuantizedSteps: editor.totalSixteenths,
      quantizationInfo: { stepsPerQuarter: 4 },
    };
    return merge
      ? mm.sequences.mergeConsecutiveNotes(noteSequence)
      : mm.sequences.clone(noteSequence);
  }

  start() {
    if (this.isPlayerLoaded) {
      if (editor.allNotes.length === 0) {
        return;
      }

      const sequence = this.getMagentaNoteSequence(editor.unmutedNotes);
      const loopSequence = trim(sequence, this.loopStart, this.loopEnd, true);

      // trim can give a note that has quantizedStartStep == quantizedEndStep
      // when on border of trim region.
      loopSequence.notes = loopSequence.notes.filter(note => {
        return note.quantizedStartStep !== note.quantizedEndStep;
      });

      this.player.start(loopSequence);
      this.isPlaying = true;
    }
  }

  loop() {
    editor.clearPlayingNotes();
    this.start();
  }

  stop() {
    this.player.stop();
    this.isPlaying = false;
    editor.clearPlayingNotes();
  }

  getInfillMask(): InfillMask[] | undefined {
    const infillMask = [];
    editor.generationMasks.forEach((mask, voice) => {
      mask.forEach(maskIndex => {
        infillMask.push({ voice, step: maskIndex });
      });
    });
    if (infillMask.length === 0) return undefined;
    return infillMask.sort((a, b) => {
      if (a.voice === b.voice) return a.step - b.step;
      return a.voice - b.voice;
    });
  }

  async harmonize() {
    this.isWorking = true;

    // Allow the UX to respond before computing so heavily!
    await delay(200);

    if (this.isPlaying) {
      this.stop();
    }

    const nHarmonizations = sequences.nSequencesToGenerate;
    const outputSequences: NoteSequence[] = [];
    for (let i = 0; i < nHarmonizations; i++) {
      const inputNotes = [...editor.allNotes];
      const sequence = this.getMagentaNoteSequence(inputNotes);
      const infillMask = this.getInfillMask();
      const results = await this.model.infill(sequence, {
        temperature: 0.99,
        infillMask,
        discourageNotes: true,
        // 1 translates to a 1:3 ratio, 2 translates to a 1:12 ratio
        nudgeFactor: 2
      });

      const outputSequence = fromMagentaSequence(
        mm.sequences.mergeConsecutiveNotes(results)
      );

      // Now, filter the outputSequence by removing the notes that were supplied to the model.
      const inputNotesSet = new Set<string>();
      const makeKey = note =>
        `${note.pitch}:${note.position}:${note.duration}:${note.voice}`;
      inputNotes.forEach(note => {
        inputNotesSet.add(makeKey(note));
      });
      const filteredSequence = outputSequence.filter(note => {
        const key = makeKey(note);
        return !inputNotesSet.has(key);
      });

      outputSequences.push(filteredSequence);
    }

    // Now, set the first candidate sequence to be the original, masked sequence
    const maskedSequence = editor.getMaskedSequence();
    editor.removeCandidateNoteSequence(maskedSequence);
    sequences.addCandidateSequences([maskedSequence, ...outputSequences]);

    // Select the first, non-masked sequence
    sequences.selectCandidateSequence(1);

    this.isWorking = false;
  }
}

export default new Engine();
