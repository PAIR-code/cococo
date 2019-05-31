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
  value: number;
  position: number;
  duration: number;
  voice: number;
  isPlaying: boolean;
  isSelected: boolean;
  isMasked: boolean;
}

export class Note {
  id = generateId();
  source: Source = Source.USER;

  @observable value: number;
  @observable position: number;
  @observable duration: number;
  @observable voice: number;

  @observable isPlaying = false;
  @observable isSelected = false;
  @observable isMasked = false;

  @computed get name() {
    return tonal.Note.fromMidi(this.value);
  }

  constructor(
    value: number,
    position: number,
    duration: number,
    source: Source = Source.USER,
    voice = Voice.ALTO
  ) {
    this.value = value;
    this.position = position;
    this.duration = duration;
    this.source = source;
    this.voice = voice;
  }

  setVoice() {}

  @computed get magentaNote() {
    return {
      pitch: this.value,
      quantizedStartStep: this.position,
      quantizedEndStep: this.position + this.duration,
      instrument: this.voice,
    };
  }

  serialize(): SerializedNote {
    return {
      id: this.id,
      source: this.source,
      value: this.value,
      position: this.position,
      duration: this.duration,
      voice: this.voice,
      isPlaying: this.isPlaying,
      isSelected: this.isSelected,
      isMasked: this.isMasked,
    };
  }

  static fromSerialized(serializedNote: SerializedNote) {
    const { value, position, duration, source, voice } = serializedNote;
    const newNote = new Note(value, position, duration, source, voice);
    newNote.id = serializedNote.id;
    newNote.isPlaying = serializedNote.isPlaying;
    newNote.isSelected = serializedNote.isSelected;
    newNote.isMasked = serializedNote.isMasked;
    return newNote;
  }
}
