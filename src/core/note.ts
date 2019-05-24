import * as tonal from 'tonal';
import { computed, observable } from 'mobx';

export type Source = 'USER' | 'AGENT';

export class Note {
  source: Source = 'USER';

  @observable value: number;
  @observable position: number;
  @observable duration: number;

  @observable isPlaying = false;

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

  @computed get key() {
    return `${this.value}:${this.position}:${this.duration}`;
  }
}
