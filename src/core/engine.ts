import * as mm from '@magenta/music';
import { observable } from 'mobx';
import { Note } from './editor';
import { editorStore } from '.';
import { range } from 'lodash';
import { DEFAULT_BPM, MIN_PITCH, MAX_PITCH, NOTE_VELOCITY } from './constants';

const SOUNDFONT_URL =
  'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';
const MODEL_URL =
  'https://storage.googleapis.com/magentadata/js/checkpoints/coconet/bach';

export class Engine {
  @observable isPlayerLoaded = false;
  @observable isModelLoaded = false;
  @observable isPlaying = false;
  @observable isWorking = false;

  player = new mm.SoundFontPlayer(SOUNDFONT_URL);
  model = new mm.Coconet(MODEL_URL);

  @observable bpm = DEFAULT_BPM;

  constructor() {
    this.loadPlayer();
    this.loadModel();
  }

  async loadPlayer() {
    const allNotes: mm.NoteSequence.INote[] = range(MIN_PITCH, MAX_PITCH).map(
      pitch => {
        return {
          pitch,
          velocity: NOTE_VELOCITY,
        };
      }
    );
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
      editorStore.activeNoteValue = note.value;
      this.player.playNoteDown(note.magentaNote);
    }
  }

  playNoteUp(note: Note) {
    if (this.isPlayerLoaded) {
      editorStore.activeNoteValue = null;
      this.player.playNoteUp(note.magentaNote);
    }
  }

  getMagentaNoteSequence() {
    const noteSequence = {
      notes: editorStore.notesArray.map(note => note.magentaNote),
      tempos: [{ time: 0, qpm: this.bpm }],
      totalQuantizedSteps: editorStore.totalSixteenths,
      quantizationInfo: { stepsPerQuarter: 4 },
    };
    return mm.sequences.mergeConsecutiveNotes(noteSequence);
  }

  start() {
    if (this.isPlayerLoaded) {
      if (editorStore.notesArray.length === 0) {
        console.log('🤔 empty notes... not playing...');
        return;
      }

      const sequence = this.getMagentaNoteSequence();
      this.player.start(sequence);
      this.isPlaying = true;
    }
  }

  stop() {
    this.player.stop();
    this.isPlaying = false;
  }

  async harmonize() {
    this.isWorking = true;

    // Allow the UX to respond before computing so heavily!
    await delay(200);

    if (this.isPlaying) {
      this.stop();
    }

    const sequence = this.getMagentaNoteSequence();

    const results = await this.model.infill(sequence, {
      temperature: 0.99,
    });

    const output = mm.sequences.mergeConsecutiveNotes(results);

    console.log('🔥', output);

    this.isWorking = false;
    editorStore.addAgentNotes(output.notes);
  }
}

function delay(ms = 1) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}
