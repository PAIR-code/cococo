import * as mm from '@magenta/music';
import { observable } from 'mobx';
import { Note } from './note';
import editor from './editor';
import { range } from 'lodash';
import * as Tone from 'tone';

import {
  DEFAULT_BPM,
  MIN_PITCH,
  MAX_PITCH,
  NOTE_VELOCITY,
  SOUNDFONT_URL,
  MODEL_URL,
} from './constants';
import { Voice } from './note';

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
    editor.setNotePlaying(pitch, quantizedStartStep);
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

      const sequence = this.getMagentaNoteSequence(editor.allNotes);
      this.player.start(sequence);
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

  getNotesToHarmonize() {
    return editor.allNotes.filter(note => !note.isMasked);
  }

  getInfillMask(): InfillMask[] | undefined {
    const mask = [];
    const maskedNotes = editor.allNotes.filter(note => note.isMasked);
    for (const note of maskedNotes) {
      const { position, duration, voice } = note;
      for (let step = position; step < position + duration; step++) {
        mask.push({ voice, step });
      }
    }
    if (mask.length === 0) return undefined;
    return mask.sort((a, b) => {
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

    const notesToHarmonize = this.getNotesToHarmonize();
    const sequence = this.getMagentaNoteSequence(notesToHarmonize);

    const infillMask = this.getInfillMask();
    const results = await this.model.infill(sequence, {
      temperature: 0.99,
      infillMask,
    });

    const output = mm.sequences.mergeConsecutiveNotes(results);

    this.isWorking = false;
    editor.addAgentNotes(output.notes);
  }
}

export default new Engine();
