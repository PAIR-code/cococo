import { observable } from 'mobx';
import { Note, NoteSequence } from './note';
import editor from './editor';

export class Sequences {
  @observable nSequencesToGenerate = 2;
  @observable generatedSequences: NoteSequence[][] = [];

  @observable candidateSequences: NoteSequence[] = [];
  @observable selectedCandidateSequenceIndex = 0;

  addCandidateSequences = (sequences: NoteSequence[]) => {
    this.generatedSequences.push(sequences);
    this.candidateSequences = sequences;
  };

  getEmptySequence = () => {
    return [];
  };

  selectCandidateSequence = (index: number | null) => {
    this.selectedCandidateSequenceIndex = index;
    editor.setTempNotes(this.candidateSequences[index]);
  };

  commitSelectedCandidateSequence = () => {
    const index = this.selectedCandidateSequenceIndex;
    editor.setTempNotes([]);
    editor.addAgentNotes(this.candidateSequences[index]);
    this.candidateSequences = [];
  };

  clearCandidateSequences = () => {
    this.candidateSequences = [];
    this.selectedCandidateSequenceIndex = 0;
    editor.setTempNotes([]);
  };
}

export default new Sequences();
