import * as mm from '@magenta/music';
import { observable } from 'mobx';
import { Note } from './note';
import { editor } from './index';
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
import { thisExpression } from '@babel/types';

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

export class Engine {
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
      editor.activeNoteValue = note.value;
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
        console.log('🤔 empty notes... not playing...');
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

  async harmonize() {
    this.isWorking = true;

    // Allow the UX to respond before computing so heavily!
    await delay(200);

    if (this.isPlaying) {
      this.stop();
    }

    const sequence = this.getMagentaNoteSequence(editor.userNotes);

    const results = await this.model.infill(sequence, {
      temperature: 0.99,
    });

    const output = mm.sequences.mergeConsecutiveNotes(results);

    output.notes = output.notes.filter(note => {
      const { pitch, quantizedStartStep: position } = note;
      const overlaps = editor.overlapsWithUserNote(pitch, position);
      return !overlaps;
    });

    this.isWorking = false;
    editor.addAgentNotes(output.notes);
  }
}

function delay(ms = 1) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}
