import { observable } from 'mobx';
import { Note, NoteSequence } from './note';
import editor from './editor';

export class Sequences {
  @observable nSequencesToGenerate = 2;
  @observable generatedSequences: NoteSequence[][] = [];

  @observable candidateSequences: NoteSequence[] | null = null;
  @observable selectedCandidateSequenceIndex: number | null = null;

  addSequences = (sequences: NoteSequence[]) => {
    this.generatedSequences.push(sequences);
    this.candidateSequences = sequences;
    this.selectCandidateSequence(0);
  };

  getEmptySequence = () => {
    return [];
  };

  selectCandidateSequence = (index: number | null) => {
    this.selectedCandidateSequenceIndex = index;
    editor.setTempNotes(index === null ? [] : this.candidateSequences[index]);
  };

  commitSelectedCandidateSequence = () => {
    const index = this.selectedCandidateSequenceIndex;
    if (index !== null) {
      editor.setTempNotes([]);
      editor.addAgentNotes(this.candidateSequences[index]);
    }
    this.candidateSequences = null;
  };

  clearCandidateSequences = () => {
    this.candidateSequences = null;
    this.selectedCandidateSequenceIndex = null;
    editor.setTempNotes([]);
  };
}

export default new Sequences();
