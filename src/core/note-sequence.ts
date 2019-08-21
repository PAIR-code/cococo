import { computed, observable } from 'mobx';
import { Note, SerializedNote } from './note';
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

  isEmpty() {
    return this.notes.length === 0;
  }

  static overlaps(note: Note, positionRange: number[], pitchRange: number[]) {
    const { pitch: pitch, position, duration } = note;
    const [startPosition, endPosition] = positionRange;
    const [startPitch, endPitch] = pitchRange;

    if (pitch < startPitch || pitch > endPitch) {
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

  static mergeConsecutiveNotes(inputNotes: Note[]) {
    const notesPerVoice = new Map<number, Note[]>();
    for (const note of inputNotes) {
      const notes = notesPerVoice.get(note.voice) || [];
      notes.push(note);
      notesPerVoice.set(note.voice, notes);
    }

    for (const [voice, notes] of notesPerVoice.entries()) {
      notes.sort((a, b) => a.position - b.position);
      const joinedNotes: Note[] = [];
      let joiningNote: Note | null = null;

      for (let i = 0; i < notes.length; i++) {
        if (joiningNote === null) joiningNote = notes[i];
        const { end, pitch, duration, position, source, voice } = joiningNote;
        const nextNote = notes[i + 1];
        if (nextNote && end === nextNote.start && pitch === nextNote.pitch) {
          const newDuration = duration + nextNote.duration;
          joiningNote = new Note(pitch, position, newDuration, source, voice);
        } else {
          joinedNotes.push(joiningNote);
          joiningNote = null;
        }
      }
      notesPerVoice.set(voice, joinedNotes);
    }

    const flattened: Note[] = [];
    for (const notes of notesPerVoice.values()) {
      flattened.push(...notes);
    }
    return new NoteSequence(flattened);
  }

  static empty() {
    return new NoteSequence();
  }
}

export interface SerializedNoteSequence {
  notes: SerializedNote[];
}
