import { observable } from 'mobx';
import * as mm from '@magenta/music';

export class Sequences {
  @observable generatedSequences: mm.NoteSequence[][] = [];

  addSequences(sequences: mm.NoteSequence[]) {
    this.generatedSequences.push(sequences);
  }
}

export default new Sequences();
