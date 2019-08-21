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
import { computed, observable, toJS } from 'mobx';
import * as mm from '@magenta/music';

import featureFlags from './feature-flags';
import logging, { Events } from './logging';
import { Note } from './note';
import { NoteSequence } from './note-sequence';
import { editor, masks, player } from '../core';
import { Coconet } from './coconet';
import { fromMagentaSequence, getMagentaNoteSequence } from './magenta-utils';
import { MODEL_URL, DifferenceFromOriginal, Mood } from './constants';
import undo, { undoable } from '../core/undo';

interface InfillMask {
  step: number;
  voice: number;
}

export class Generator {
  model = new Coconet(MODEL_URL);
  @observable isWorking = false;
  @observable isModelLoaded = true;

  @observable private _nSequencesToGenerate = featureFlags.baseline ? 1 : 2;
  @computed get nSequencesToGenerate() {
    return this._nSequencesToGenerate;
  }
  setNSequencesToGenerate(nSequences: number) {
    logging.logEvent(Events.SET_N_SAMPLES_TO_GENERATE, nSequences);
    this._nSequencesToGenerate = nSequences;
  }

  @observable private _conventionalSurprising = 0;
  @computed get conventionalSurprising() {
    return this._conventionalSurprising;
  }
  setConventionalSurprising(value: number) {
    logging.logEvent(Events.SET_CONVENTIONAL_SURPRISING, value);
    this._conventionalSurprising = value;
  }

  @observable private _majorMinor = 0;
  @computed get majorMinor() {
    return this._majorMinor;
  }
  setMajorMinor(value: number) {
    logging.logEvent(Events.SET_MAJOR_MINOR, value);
    this._majorMinor = value;
  }

  @observable private _differenceFromOriginal =
    DifferenceFromOriginal.SomewhatDifferent;
  @computed get differenceFromOriginal() {
    return this._differenceFromOriginal;
  }
  setDifferenceFromOriginal(value: number) {
    logging.logEvent(Events.SET_SIMILAR_DIFFERENT, value);
    this._differenceFromOriginal = value;
  }

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
    logging.logEvent(Events.SELECT_CANDIDATE_SEQUENCE, index);
    this.selectedCandidateSequenceIndex = index;

    // Try restarting the player with the new sequence added.
    if (player.isPlaying) {
      player.restart();
    }
  };

  @undoable('generator.commitSelectedCandidateSequence')
  commitSelectedCandidateSequence(clearMasks = true, shouldLog = true) {
    if (shouldLog) {
      logging.logEvent(Events.CHOOSE_CANDIDATE_SEQUENCE, undo.getUndoStep());
    }
    // Add the selected sequence
    const sequence = this.selectedCandidateSequence;
    if (sequence) {
      editor.addGeneratedSequence(sequence);
      if (clearMasks) masks.clearMasks();
    }

    // Then, clear the sequences
    this.clearCandidateSequences(false /** shouldLog */);
  }

  addBackOriginalSequence = () => {
    // Add back the original sequence
    editor.addGeneratedSequence(this.candidateSequences[0]);

    // Then, clear the sequences
    this.clearCandidateSequences();
  };

  clearCandidateSequences = (shouldLog = true) => {
    if (shouldLog) logging.logEvent(Events.CLEAR_CANDIDATE_SEQUENCES);
    this.selectedCandidateSequenceIndex = 0;
    this.candidateSequences = [];
  };

  getInfillMask(): InfillMask[] | undefined {
    const infillMask = [];
    masks.userOrImplicitMasks.forEach((mask, voice) => {
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

  private prepareForHarmonization() {
    // First, commit any selected candidate sequence before beginning harmonization
    if (this.candidateSequences.length) {
      const clearMasks = false;
      const shouldLog = false;
      this.commitSelectedCandidateSequence(clearMasks, shouldLog);
    }

    // If we're working from an implicit mask, promote that mask to the
    // _userMasks in order to properly handle note highlighting
    if (featureFlags.baseline && masks.doImplicitMasksExist) {
      masks.addImplicitMasksToUserMasks();
    }
  }

  private getSimilarDifferentConfig() {
    const { differenceFromOriginal } = this;

    // Check to see if the selected value is less than the cap values for
    // similarity
    if (differenceFromOriginal < DifferenceFromOriginal.Similar) {
      return {
        discourageNotes: false,
        nudgeFactor: 2, // 2 translates to a 1:12 ratio
      };
    } else if (
      differenceFromOriginal < DifferenceFromOriginal.SomewhatDifferent
    ) {
      return {
        discourageNotes: false,
        nudgeFactor: 1, // 1 translates to a 1:3 ratio
      };
    } else if (differenceFromOriginal < DifferenceFromOriginal.Different) {
      return {
        discourageNotes: true,
        nudgeFactor: 1,
      };
    } else if (differenceFromOriginal <= DifferenceFromOriginal.VeryDifferent) {
      return {
        discourageNotes: true,
        nudgeFactor: 2,
      };
    } else {
      return {
        discourageNotes: true,
        nudgeFactor: 2,
      };
    }
  }

  private getMoodConfig() {
    const { majorMinor: happySad } = this;
    const happyNeutralSad = this.binHappySad(happySad);

    let moodConfig;
    if (happyNeutralSad !== Mood.NEUTRAL) {
      moodConfig = {
        key: editor.key,
        mode: editor.mode,
        happy: happyNeutralSad === Mood.HAPPY,
      };
    }
    return moodConfig;
  }

  async generate() {
    undo.beginUndoable('generator.generate');

    logging.logEvent(Events.GENERATE);
    this.prepareForHarmonization();
    this.isWorking = true;

    // Allow the UX to respond before computing so heavily!
    await delay(200);

    if (player.isPlaying) {
      player.stop();
    }

    const { conventionalSurprising, nSequencesToGenerate } = this;
    const temperature = this.computeTemperature(conventionalSurprising);
    const similarDifferentConfig = this.getSimilarDifferentConfig();
    const moodConfig = this.getMoodConfig();

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
        similarDifferentConfig,
        moodConfig,
      });

      const output = fromMagentaSequence(results);
      // Now, we need to remove the notes that have been returned that weren't
      // masked
      const generationMasks = masks.userOrImplicitMasks;
      const maskIndices = new Set<string>();
      generationMasks.forEach((mask, voice) => {
        mask.forEach(index => maskIndices.add(`${voice}:${index}`));
      });
      const masked = output.filter(note => {
        const key = `${note.voice}:${note.position}`;
        return maskIndices.has(key);
      });

      // Unfortunately, the magenta util doesn't merge notes that touch on a
      // measure boundary, so we'll have to do it ourselves...
      const joined = NoteSequence.mergeConsecutiveNotes(masked);
      outputNotes.push(joined.notes);
    }

    // Now, set the first candidate sequence to be the original, masked sequence
    const maskedNotes = masks.maskedNotes;
    editor.removeNotes(maskedNotes);
    const noteSequences = [maskedNotes, ...outputNotes].map(notes => {
      return new NoteSequence(notes);
    });

    logging.logEvent(Events.GENERATE, undo.getUndoStep());

    this.setCandidateSequences(noteSequences);
    // Select the first, non-masked sequence
    this.selectCandidateSequence(1);

    if (featureFlags.baseline) {
      const generationMasks = toJS(masks.userOrImplicitMasks);
      const clearMasks = true;
      const shouldLog = false;
      this.commitSelectedCandidateSequence(clearMasks, shouldLog);
      masks.setMasks(generationMasks);
    }

    this.isWorking = false;
    undo.completeUndoable('generator.generate');
  }
}

export default new Generator();

function delay(ms = 1) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}
