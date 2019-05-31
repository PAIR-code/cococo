import * as tonal from 'tonal';
import { computed, observable } from 'mobx';

let id = 0;
function generateId() {
  return id++;
}

export type Source = 'USER' | 'AGENT';
export const enum Voice {
  ALTO = 0,
  SOPRANO = 1,
  TENOR = 2,
  BASS = 3,
}

export class Note {
  source: Source = 'USER';

  id = generateId();

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
    source: Source = 'USER',
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
}
