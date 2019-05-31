import { computed, observable } from 'mobx';
import { range } from 'lodash';
import { makeNoteScale } from './tonal-utils';
import * as mm from '@magenta/music';

import { Note, Source } from './note';
import undo, { undoable } from './undo';

import {
  DEFAULT_NOTES,
  TOTAL_SIXTEENTHS,
  MAX_PITCH,
  MIN_PITCH,
} from './constants';

export const enum EditorTool {
  DRAW = 'DRAW',
  MASK = 'MASK',
}

export interface ScaleValue {
  pitch: number;
  name: string;
}

export class Mask {
  constructor(
    public topLeftValue: number,
    public topLeftPosition: number,
    public bottomRightValue: number,
    public bottomRightPosition: number
  ) {}
}

class Editor {
  @observable notesMap = new Map<string, Note>();

  @computed get allNotes() {
    return [...this.notesMap.values()];
  }

  @computed get userNotes() {
    return this.allNotes.filter(note => note.source === Source.USER);
  }
  @computed get agentNotes() {
    return this.allNotes.filter(note => note.source === Source.AGENT);
  }

  @observable scale = makeNoteScale(MAX_PITCH, MIN_PITCH);
  @observable activeNoteValue: number | null = null;

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
    return this.scale[0].pitch;
  }

  @observable selectedTool: EditorTool = EditorTool.DRAW;

  constructor() {
    let position = 0;
    DEFAULT_NOTES.forEach(([pitch, duration], i) => {
      const note = new Note(pitch, position, duration);
      position += duration;
      this._addNote(note);
    });
    this.currentlySelectedNotes.clear();
  }

  @observable private currentlySelectedNotes = new Set<Note>();
  isNoteSelected = (note: Note) => {
    return this.currentlySelectedNotes.has(note);
  };

  @observable private currentlyPlayingNotes = new Set<Note>();
  private setCurrentlyPlaying(note: Note) {
    note.isPlaying = true;
    this.currentlyPlayingNotes.add(note);
  }

  clearPlayingNotes() {
    this.currentlyPlayingNotes.clear();
    this.allNotes.forEach(note => {
      note.isPlaying = false;
    });
  }

  setNotePlaying(pitch: number, position: number) {
    const key = this.makeNoteKey(pitch, position);
    const note = this.notesMap.get(key);
    if (note) this.setCurrentlyPlaying(note);

    // Clear all notes that are playing if the playhead has passed them
    for (const playingNote of this.currentlyPlayingNotes.values()) {
      if (playingNote.position + playingNote.duration <= position) {
        playingNote.isPlaying = false;
        this.currentlyPlayingNotes.delete(playingNote);
      }
    }
  }

  private makeNoteKey(pitch: number, position: number) {
    return `${pitch}:${position}`;
  }

  private _addNote(note: Note) {
    const { position, pitch: pitch } = note;
    const key = this.makeNoteKey(pitch, position);
    this.notesMap.set(key, note);
  }

  private _removeNote(note: Note) {
    const { position, pitch: pitch } = note;
    const key = this.makeNoteKey(pitch, position);
    this.notesMap.delete(key);
  }

  overlapsWithUserNote(pitch: number, position: number) {
    const key = this.makeNoteKey(pitch, position);
    return this.notesMap.has(key);
  }

  getValueFromScaleIndex(scaleIndex: number) {
    return this.scale[scaleIndex].pitch;
  }

  @undoable()
  addNote(note: Note, shouldSelect = false) {
    this._addNote(note);
    if (shouldSelect) {
      this.currentlySelectedNotes.clear();
      this.currentlySelectedNotes.add(note);
    }
  }

  @undoable()
  addAgentNotes(sequence: mm.NoteSequence.INote[], replace = true) {
    if (replace) {
      this.clearAgentNotes();
    }
    sequence.forEach(item => {
      const position = item.quantizedStartStep;
      const duration = item.quantizedEndStep - item.quantizedStartStep;
      const voice = item.instrument;
      const note = new Note(
        item.pitch,
        position,
        duration,
        Source.AGENT,
        voice
      );
      const key = this.makeNoteKey(item.pitch, position);
      this.notesMap.set(key, note);
    });
  }

  @undoable()
  clearAgentNotes() {
    for (const [key, note] of this.notesMap.entries()) {
      if (note.source === Source.AGENT) {
        this.notesMap.delete(key);
      }
    }
  }

  startNoteDrag() {
    undo.beginUndoable();
  }

  // Resolves conflicting note edits
  endNoteDrag(note: Note, didUpdate = true) {
    for (let other of this.userNotes) {
      if (other.position === note.position && other.pitch === note.pitch) {
        const key = this.makeNoteKey(other.pitch, other.position);
        this.notesMap.delete(key);
      }
    }
    undo.completeUndoable();
  }

  // Not an undoable function because this is what is used by the undo manager.
  replaceAllNotes(notes: Note[]) {
    this.notesMap.clear();
    for (const note of notes) {
      this._addNote(note);
    }
  }

  private overlaps(note: Note, positionRange: number[], pitchRange: number[]) {
    const { pitch: pitch, position, duration } = note;
    const [startPosition, endPosition] = positionRange;
    const [startValue, endValue] = pitchRange;
    if (pitch < startValue || pitch > endValue) {
      return false;
    } else if (position >= startPosition && position < endPosition) {
      return true;
    } else if (
      position < startPosition &&
      position + duration > startPosition
    ) {
      return true;
    }

    return false;
  }

  private replaceNoteWithNotes(note: Note, otherNotes: Note[]) {
    this._removeNote(note);
    otherNotes.forEach(otherNote => this._addNote(otherNote));
  }

  @undoable()
  maskNotes(positionRange: number[], pitchRange: number[]) {
    for (const note of [...this.userNotes, ...this.agentNotes]) {
      if (this.overlaps(note, positionRange, pitchRange)) {
        // Split any notes that overlap the range, then set the overlapping portion to be masked.
        const [maskStart, maskEnd] = positionRange;
        const noteStart = note.position;
        const noteEnd = note.end;

        console.log({ maskStart, maskEnd, noteStart, noteEnd });

        // Mask covers all of note
        if (noteStart >= maskStart && noteEnd <= maskEnd) {
          note.isMasked = true;
        } else if (noteStart >= maskStart && noteEnd > maskEnd) {
          const a = Note.fromNote(note).moveEnd(maskEnd);
          const b = Note.fromNote(note).moveStart(maskEnd);
          a.isMasked = true;
          this.replaceNoteWithNotes(note, [a, b]);
        } else if (noteStart < maskStart && noteEnd <= maskEnd) {
          const a = Note.fromNote(note).moveEnd(maskStart);
          const b = Note.fromNote(note).moveStart(maskStart);
          b.isMasked = true;
          this.replaceNoteWithNotes(note, [a, b]);
        } else if (noteStart < maskStart && noteEnd > maskEnd) {
          const a = Note.fromNote(note).moveEnd(maskStart);
          const b = Note.fromNote(note)
            .moveStart(maskStart)
            .moveEnd(maskEnd);
          const c = Note.fromNote(note).moveStart(maskEnd);
          b.isMasked = true;
          this.replaceNoteWithNotes(note, [a, b, c]);
        }
      }
    }
  }
}

export default new Editor();
