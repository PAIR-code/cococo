import { computed, observable } from 'mobx';
import { Note } from './note';
import { MIN_PITCH, MAX_PITCH } from './constants';

export class NoteSequence {
  @observable private _notes: Note[];
  @computed get notes() {
    return [...this._notes];
  }

  constructor(notes: Note[] = []) {
    this._notes = notes;
  }

  addNote(note: Note, trimOverlappingVoices = true) {
    if (trimOverlappingVoices) {
      this.trimOverlappingVoices(note);
    }
    this._notes.push(note);
  }

  removeNote(note: Note) {
    this._notes = this._notes.filter(other => other !== note);
  }

  setNotes(notes: Note[]) {
    this._notes = notes;
  }

  clearNotes() {
    this._notes = [];
  }

  trimOverlappingVoices(note: Note) {
    const range = [note.start, note.end];
    const overlappingNotes = this._notes.filter(
      otherNote =>
        otherNote !== note &&
        otherNote.voice === note.voice &&
        NoteSequence.overlaps(otherNote, range, [MIN_PITCH, MAX_PITCH])
    );

    overlappingNotes.forEach(otherNote => {
      if (otherNote.end > note.end) {
        otherNote.moveStart(note.end);
      } else {
        this.removeNote(otherNote);
      }
    });
  }

  static overlaps(note: Note, positionRange: number[], pitchRange: number[]) {
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

  static empty() {
    return new NoteSequence();
  }
}
