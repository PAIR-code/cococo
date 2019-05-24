import { computed, observable } from 'mobx';
import { makeNoteScale } from './tonal-utils';
import { range } from 'lodash';
import * as mm from '@magenta/music';

import { Note } from './note';
import { engine } from './index';
import {
  DEFAULT_NOTES,
  TOTAL_SIXTEENTHS,
  MAX_PITCH,
  MIN_PITCH,
} from './constants';

export interface ScaleValue {
  value: number;
  name: string;
}

export class Editor {
  @observable private userNotesMap = new Map<string, Note>();
  @observable private agentNotesMap = new Map<string, Note>();

  @computed get userNotes() {
    return [...this.userNotesMap.values()];
  }
  @computed get agentNotes() {
    return [...this.agentNotesMap.values()];
  }

  @computed get allNotes() {
    return [...this.userNotes, ...this.agentNotes];
  }

  @observable scale = makeNoteScale(MAX_PITCH, MIN_PITCH);
  @observable activeNoteValue: number | null = null;

  @observable currentlySelectedNotes = new Set<Note>();
  isNoteSelected = (note: Note) => {
    return this.currentlySelectedNotes.has(note);
  };

  @observable totalSixteenths = TOTAL_SIXTEENTHS;
  @observable quantizeStep = 2;

  @computed get nDivisions() {
    return this.totalSixteenths / this.quantizeStep;
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
    DEFAULT_NOTES.forEach((pitch, i) => {
      const note = new Note(pitch, i * 2, 2);
      this.addNote(note);
    });
    this.currentlySelectedNotes.clear();
  }

  private makeNoteKey(pitch: number, position: number) {
    return `${pitch}:${position}`;
  }

  overlapsWithUserNote(pitch: number, position: number) {
    const key = this.makeNoteKey(pitch, position);
    return this.userNotesMap.has(key);
  }

  handleGridClick(scaleIndex: number, divisionIndex: number) {
    const value = this.scale[scaleIndex].value;
    const position = divisionIndex * this.quantizeStep;
    const duration = this.quantizeStep;
    const note = new Note(value, position, duration);

    this.addNote(note);

    engine.playNote(note);
  }

  handleNoteClick(note: Note) {
    const { position, value } = note;
    const key = this.makeNoteKey(value, position);
    this.userNotesMap.delete(key);
  }

  addNote(note: Note) {
    const { position, value } = note;
    const key = this.makeNoteKey(value, position);
    this.userNotesMap.set(key, note);
    this.currentlySelectedNotes.clear();
    this.currentlySelectedNotes.add(note);
  }

  addAgentNotes(sequence: mm.NoteSequence.INote[]) {
    sequence.forEach(item => {
      const position = item.quantizedStartStep;
      const duration = item.quantizedEndStep - item.quantizedStartStep;
      const note = new Note(item.pitch, position, duration, 'AGENT');
      const key = this.makeNoteKey(item.pitch, position);
      this.agentNotesMap.set(key, note);
    });
  }
}
