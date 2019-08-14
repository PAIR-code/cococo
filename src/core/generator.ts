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
import * as mm from '@magenta/music';

import { Note } from './note';
import { NoteSequence } from './note-sequence';
import { editor, masks, player } from '../core';
import { Coconet } from './coconet';
import { fromMagentaSequence, getMagentaNoteSequence } from './magenta-utils';
import { MODEL_URL, DifferenceFromOriginal, Mood } from './constants';

interface InfillMask {
  step: number;
  voice: number;
}

export class Generator {
  model = new Coconet(MODEL_URL);
  @observable isWorking = false;
  @observable isModelLoaded = true;

  @observable nSequencesToGenerate = 2;
  @observable conventionalSurprising = -1;
  @observable happySad = 0;
  @observable differenceFromOriginal = DifferenceFromOriginal.SomewhatDifferent;

  @observable candidateSequences: NoteSequence[] = [];
  @observable selectedCandidateSequenceIndex: number | null = 0;

  @computed get selectedCandidateSequence(): NoteSequence | null {
    const index = this.selectedCandidateSequenceIndex;
    if (index === null || this.candidateSequences.length === 0) return null;
    return this.candidateSequences[index] || null;
  }

  constructor() {
    this.loadModel();
  }

  async loadModel() {
    await this.model.initialize();
    this.isModelLoaded = true;
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

  setCandidateSequences = (sequences: NoteSequence[]) => {
    this.candidateSequences = sequences;
  };

  getEmptySequence = () => {
    return [];
  };

  selectCandidateSequence = (index: number | null) => {
    this.selectedCandidateSequenceIndex = index;

    // Try restarting the player with the new sequence added.
    if (player.isPlaying) {
      player.stop();
      player.start();
    }
  };

  commitSelectedCandidateSequence = () => {
    // Add the selected sequence
    const sequence = this.selectedCandidateSequence;
    if (sequence) {
      editor.addGeneratedSequence(sequence);
    }

    // Then, clear the sequences
    this.clearCandidateSequences();
  };

  addBackOriginalSequence = () => {
    // Add back the original sequence
    editor.addGeneratedSequence(this.candidateSequences[0]);

    // Then, clear the sequences
    this.clearCandidateSequences();
  };

  clearCandidateSequences = () => {
    this.selectedCandidateSequenceIndex = 0;
    this.candidateSequences = [];
  };

  getInfillMask(): InfillMask[] | undefined {
    const infillMask = [];
    masks.generationMasks.forEach((mask, voice) => {
      mask.forEach(maskIndex => {
        infillMask.push({ voice, step: maskIndex });
      });
    });
    if (infillMask.length === 0) return undefined;
    return infillMask.sort((a, b) => {
      if (a.voice === b.voice) return a.step - b.step;
      return a.voice - b.voice;
    });
  }

  computeTemperature(conventionalSurprising: number) {
    // 0.5 = 1/2 = 2^(-1) is midpoint
    // 0.125 = 1/8 = 2^(-3) is min
    // 2 = 2^(1) is max
    return 2 ** conventionalSurprising;
  }

  binHappySad(happySad: number) {
    if (happySad < -0.33) {
      return Mood.SAD;
    } else if (happySad < 0.33) {
      return Mood.NEUTRAL;
    } else {
      return Mood.HAPPY;
    }
  }

  async harmonize() {
    this.isWorking = true;

    // Allow the UX to respond before computing so heavily!
    await delay(200);

    if (player.isPlaying) {
      player.stop();
    }

    const {
      conventionalSurprising,
      differenceFromOriginal,
      nSequencesToGenerate,
      happySad,
    } = this;
    const temperature = this.computeTemperature(conventionalSurprising);
    const happyNeutralSad = this.binHappySad(happySad);
    let moodConfig;
    if (happyNeutralSad !== Mood.NEUTRAL) {
      moodConfig = {
        key: editor.key,
        mode: editor.mode,
        happy: happyNeutralSad === Mood.HAPPY,
      };
    }
    let discourageNotes;
    let nudgeFactor;
    // Check to see if the selected value is less than the cap values for
    // similarity
    if (differenceFromOriginal < DifferenceFromOriginal.Similar) {
      discourageNotes = false;
      nudgeFactor = 2; // 2 translates to a 1:12 ratio
    } else if (
      differenceFromOriginal < DifferenceFromOriginal.SomewhatDifferent
    ) {
      discourageNotes = false;
      nudgeFactor = 1; // 1 translates to a 1:3 ratio
    } else if (differenceFromOriginal < DifferenceFromOriginal.Different) {
      discourageNotes = true;
      nudgeFactor = 1;
    } else if (differenceFromOriginal <= DifferenceFromOriginal.VeryDifferent) {
      discourageNotes = true;
      nudgeFactor = 2;
    }

    const outputNotes: Note[][] = [];
    for (let i = 0; i < nSequencesToGenerate; i++) {
      const inputNotes = [...editor.allNotes];
      const sequence = getMagentaNoteSequence(
        inputNotes,
        player.bpm,
        editor.totalSixteenths
      );
      const infillMask = this.getInfillMask();
      const results = await this.model.infill(sequence, {
        temperature,
        infillMask,
        discourageNotes,
        nudgeFactor,
        moodConfig,
      });

      const output = fromMagentaSequence(
        mm.sequences.mergeConsecutiveNotes(results)
      );

      // Now, filter the output by removing the notes that were supplied to the model.
      const inputNotesSet = new Set<string>();
      const makeKey = note =>
        `${note.pitch}:${note.position}:${note.duration}:${note.voice}`;
      inputNotes.forEach(note => {
        inputNotesSet.add(makeKey(note));
      });
      const filtered = output.filter(note => {
        const key = makeKey(note);
        return !inputNotesSet.has(key);
      });

      outputNotes.push(filtered);
    }

    // Now, set the first candidate sequence to be the original, masked sequence
    const maskedNotes = masks.maskedNotes;
    editor.removeNotes(maskedNotes);
    const noteSequences = [maskedNotes, ...outputNotes].map(notes => {
      return new NoteSequence(notes);
    });

    this.setCandidateSequences(noteSequences);
    // Select the first, non-masked sequence
    this.selectCandidateSequence(1);

    this.isWorking = false;
  }
}

export default new Generator();

function delay(ms = 1) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}
