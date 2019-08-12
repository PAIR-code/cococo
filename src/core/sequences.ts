/* Copyright 2019 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/
import { computed, observable } from 'mobx';

import { Note } from './note';
import { NoteSequence } from './note-sequence';
import editor from './editor';
import engine from './engine';
import { DifferenceFromOriginal } from './constants';

export class Sequences {
  @observable nSequencesToGenerate = 2;
  @observable conventionalSurprising = -1;
  @observable happySad = 0;
  @observable differenceFromOriginal = DifferenceFromOriginal.SomewhatDifferent;

  @observable candidateSequences: NoteSequence[] = [];
  @observable selectedCandidateSequenceIndex: number | null = 0;

  @computed get selectedCandidateSequence(): NoteSequence | null {
    const index = this.selectedCandidateSequenceIndex;
    return this.candidateSequences[index] || null;
  }

  addNoteToSelected(note: Note) {
    const sequence = this.selectedCandidateSequence;
    if (sequence) {
      sequence.addNote(note);
    }
  }

  removeNoteFromSelected(note: Note) {
    const sequence = this.selectedCandidateSequence;
    if (sequence) {
      sequence.removeNote(note);
    }
  }

  setSelectedCandidateSequence(sequence: NoteSequence) {
    const index = this.selectedCandidateSequenceIndex;
    this.candidateSequences[index] = sequence;
  }

  addCandidateSequences = (sequences: NoteSequence[]) => {
    this.candidateSequences = sequences;
  };

  getEmptySequence = () => {
    return [];
  };

  selectCandidateSequence = (index: number | null) => {
    this.selectedCandidateSequenceIndex = index;

    // Try restarting the player with the new sequence added.
    if (engine.isPlaying) {
      engine.stop();
      engine.start();
    }
  };

  commitSelectedCandidateSequence = () => {
    const index = this.selectedCandidateSequenceIndex;
    editor.addAgentNotes(this.candidateSequences[index], /** replace */ false);
    this.candidateSequences = [];
  };

  clearCandidateSequences = () => {
    // Add back the original sequence
    editor.addAgentNotes(this.candidateSequences[0], /** replace */ false);

    // Then, clear the sequences
    this.selectedCandidateSequenceIndex = 0;
    this.candidateSequences = [];
  };
}

export default new Sequences();
