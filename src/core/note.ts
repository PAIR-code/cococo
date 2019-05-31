import * as tonal from 'tonal';
import { computed, observable } from 'mobx';

let id = 0;
function generateId() {
  return id++;
}

export const enum Source {
  USER = 'USER',
  AGENT = 'AGENT',
}
export const enum Voice {
  ALTO = 0,
  SOPRANO = 1,
  TENOR = 2,
  BASS = 3,
}

export interface SerializedNote {
  id: number;
  source: Source;
  pitch: number;
  position: number;
  duration: number;
  voice: number;
  isMasked: boolean;
}

export class Note {
  id = generateId();
  source: Source = Source.USER;

  @observable pitch: number;
  @observable position: number;
  @observable duration: number;
  @observable voice: number;

  @observable isMasked = false;

  @observable isPlaying = false;
  @observable isSelected = false;

  @computed get name() {
    return tonal.Note.fromMidi(this.pitch);
  }

  @computed get start() {
    return this.position;
  }

  @computed get end() {
    return this.position + this.duration;
  }

  constructor(
    pitch: number,
    position: number,
    duration: number,
    source: Source = Source.USER,
    voice = Voice.ALTO
  ) {
    this.pitch = pitch;
    this.position = position;
    this.duration = duration;
    this.source = source;
    this.voice = voice;
  }

  @computed get magentaNote() {
    return {
      pitch: this.pitch,
      quantizedStartStep: this.position,
      quantizedEndStep: this.end,
      instrument: this.voice,
    };
  }

  serialize(): SerializedNote {
    return {
      id: this.id,
      source: this.source,
      pitch: this.pitch,
      position: this.position,
      duration: this.duration,
      voice: this.voice,
      isMasked: this.isMasked,
    };
  }

  moveStart(nextPosition: number) {
    nextPosition = Math.min(nextPosition, this.end - 1);
    const nextDuration = this.duration - (nextPosition - this.position);
    this.duration = Math.max(1, nextDuration);
    this.position = nextPosition;
    return this;
  }

  moveEnd(nextEnd: number) {
    nextEnd = Math.max(nextEnd, this.position + 1);
    const nextDuration = this.duration - (this.end - nextEnd);
    this.duration = Math.max(1, nextDuration);
    return this;
  }

  static fromSerialized(serializedNote: SerializedNote) {
    const { pitch, position, duration, source, voice } = serializedNote;
    const newNote = new Note(pitch, position, duration, source, voice);
    newNote.id = serializedNote.id;
    newNote.isMasked = serializedNote.isMasked;
    return newNote;
  }

  // Copies all note data to a new note, with new id;
  static fromNote(note: Note) {
    return new Note(
      note.pitch,
      note.position,
      note.duration,
      note.source,
      note.voice
    );
  }
}
