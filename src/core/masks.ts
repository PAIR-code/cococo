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
import * as _ from 'lodash';

import editor from './editor';
import featureFlags from './feature-flags';
import { Note } from './note';

export class EditorMaskRegion {
  constructor(
    public topLeftValue: number,
    public topLeftPosition: number,
    public bottomRightValue: number,
    public bottomRightPosition: number
  ) {}
}

class Masks {
  // Masks are maintained as an array of masked sixteenth notes, one per voice.
  @observable generationMasks: number[][] = [[], [], [], []];

  constructor() {
    if (featureFlags.baseline) {
      // Automatically set full generationMasks when in baseline mode
      this.generationMasks = _.range(4).map(i => {
        return i === 0 ? [] : _.range(8);
      });
    }
  }

  maskNotes(positionRange: number[], pitchRange: number[], replaceMask = true) {
    const notesInMask = editor.getNotesInRange(positionRange, pitchRange);

    notesInMask.forEach(note => {
      const maskStart = Math.min(positionRange[0], note.start);
      const maskEnd = Math.max(positionRange[1], note.end);
      const maskRange = _.range(maskStart, maskEnd);

      if (replaceMask) {
        this.replaceMask(note.voice, maskRange);
      } else {
        this.addMask(note.voice, maskRange);
      }
    });
  }

  replaceMask(voiceIndex: number, mask: number[]) {
    this.generationMasks[voiceIndex] = [...mask];
  }

  addMask(voiceIndex: number, mask: number[]) {
    const maskSet = new Set<number>(this.generationMasks[voiceIndex]);
    mask.forEach(maskIndex => maskSet.add(maskIndex));
    this.generationMasks[voiceIndex] = [...maskSet.values()].sort(
      (a, b) => a - b
    );
  }

  removeMask(voiceIndex: number, mask: number[]) {
    const maskSet = new Set<number>(this.generationMasks[voiceIndex]);
    mask.forEach(maskIndex => maskSet.delete(maskIndex));
    this.generationMasks[voiceIndex] = [...maskSet.values()].sort(
      (a, b) => a - b
    );
  }

  clearMasks() {
    this.generationMasks = this.generationMasks.map(() => []);
  }

  isNoteMasked(note: Note) {
    const { voice, start, end } = note;
    const mask = this.generationMasks[voice];

    for (let maskIndex of mask) {
      if (maskIndex >= start && maskIndex < end) return true;
    }
    return false;
  }

  @computed get maskedNotes() {
    const notes = editor.allNotes;
    const maskedNotes: Note[] = [];

    for (const note of notes) {
      if (this.isNoteMasked(note)) maskedNotes.push(note);
    }

    return maskedNotes;
  }

  @computed get nonMaskedNotes() {
    return editor.allNotes.filter(note => !this.isNoteMasked(note));
  }

  @computed get doMasksExist() {
    return _.some(this.generationMasks, mask => mask.length > 0);
  }
}

export default new Masks();
