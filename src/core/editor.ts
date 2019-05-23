import { computed, observable } from 'mobx';
import { makeNoteScale } from './tonal-utils';
import * as tonal from 'tonal';
import { range } from 'lodash';
import * as mm from '@magenta/music';

import { engine } from './index';
import { TOTAL_SIXTEENTHS, MAX_PITCH, MIN_PITCH } from './constants';

export type Source = 'USER' | 'AGENT';

export class Note {
  source: Source = 'USER';

  @observable value: number;
  @observable position: number;
  @observable duration: number;

  @computed get name() {
    return tonal.Note.fromMidi(this.value);
  }

  constructor(
    value: number,
    position: number,
    duration: number,
    source: Source = 'USER'
  ) {
    this.value = value;
    this.position = position;
    this.duration = duration;
    this.source = source;
  }

  @computed get magentaNote() {
    return {
      pitch: this.value,
      quantizedStartStep: this.position,
      quantizedEndStep: this.position + this.duration,
      program: 0,
    };
  }
}

export interface ScaleValue {
  value: number;
  name: string;
}

export class Editor {
  @observable notes = new Map<number, Note>();
  @observable harmonies: Note[] = [];

  @computed get notesArray() {
    return [...this.notes.values(), ...this.harmonies];
  }

  @observable scale = makeNoteScale(MAX_PITCH, MIN_PITCH);
  @observable activeNoteValue: number | null = null;

  @observable currentlySelectedNotes = new Set<Note>();
  isNoteSelected = (note: Note) => {
    return this.currentlySelectedNotes.has(note);
  };

  @observable totalSixteenths = TOTAL_SIXTEENTHS;
  @observable divisionWidth = 1;
  @computed get nDivisions() {
    return this.totalSixteenths / this.divisionWidth;
  }
  @computed get divisions() {
    const divisions = range(this.nDivisions);
    return divisions;
  }

  @computed get scaleMax() {
    return this.scale[0].value;
  }

  @observable selectedTool = 'PAINT';

  constructor() {
    (window as any).app = this;
  }

  handleGridClick(scaleIndex: number, divisionIndex: number) {
    const value = this.scale[scaleIndex].value;
    const position = divisionIndex;
    const duration = 1;
    const note = new Note(value, position, duration);
    this.addNote(note);

    engine.playNote(note);
  }

  handleNoteClick(note: Note) {
    const { position } = note;
    this.notes.delete(position);
  }

  addNote(note: Note) {
    const { position } = note;

    this.notes.set(position, note);
    this.currentlySelectedNotes.clear();
    this.currentlySelectedNotes.add(note);
  }

  addAgentNotes(sequence: mm.NoteSequence.INote[]) {
    this.harmonies = sequence.map(item => {
      const position = item.quantizedStartStep;
      const duration = item.quantizedEndStep - item.quantizedStartStep;
      const note = new Note(item.pitch, position, duration, 'AGENT');
      return note;
    });
  }
}
