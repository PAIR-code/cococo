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

import { observable } from 'mobx';
import { NoteSequence } from './note';
import editor from './editor';
import engine from './engine';
import { SimilarityToOriginal } from './constants';

export class Sequences {
  @observable nSequencesToGenerate = 2;
  @observable conventionalSurprising = -1;
  @observable happySad = 0;
  @observable similarityToOriginal = SimilarityToOriginal.SomewhatDifferent;
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

    // Try restarting the player with the new sequence added.
    if (engine.isPlaying) {
      engine.stop();
      engine.start();
    }
  };

  commitSelectedCandidateSequence = () => {
    const index = this.selectedCandidateSequenceIndex;
    editor.setTempNotes([]);
    editor.addAgentNotes(this.candidateSequences[index], /** replace */ false);
    this.candidateSequences = [];
  };

  clearCandidateSequences = () => {
    // Add back the original sequence
    editor.addAgentNotes(this.candidateSequences[0], /** replace */ false);

    // Then, clear the sequences
    this.selectedCandidateSequenceIndex = 0;
    this.candidateSequences = [];
    editor.setTempNotes([]);
  };
}

export default new Sequences();
