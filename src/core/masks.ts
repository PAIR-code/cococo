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
import { TOTAL_SIXTEENTHS } from './constants';
import undo, { undoable } from './undo';

export class EditorMaskRegion {
  constructor(
    public topLeftValue: number,
    public topLeftPosition: number,
    public bottomRightValue: number,
    public bottomRightPosition: number
  ) {}
}

export type IMask = number[];
export type IMasks = [IMask, IMask, IMask, IMask];

class Masks {
  // Masks are maintained as an array of masked sixteenth notes, one per voice.
  @observable private _userMasks: IMasks = this.emptyMasks();

  @computed private get _implicitMasks() {
    return featureFlags.baseline
      ? this.computeMasksFromEmptyRegions()
      : this.emptyMasks();
  }

  @computed get userMasks() {
    return this._userMasks;
  }

  @computed get masks() {
    // When in baseline mode, we want to infill all voices that are either
    // masked or empty.
    if (featureFlags.baseline) {
      return this.doUserMasksExist ? this._userMasks : this._implicitMasks;
    } else {
      return this._userMasks;
    }
  }

  emptyMasks(): IMasks {
    return [[], [], [], []];
  }

  private getPositionsPerVoice(notes: Note[]) {
    const notePositions = _.range(4).map(() => new Set<number>());
    notes.forEach(note => {
      const positions = _.range(note.start, note.end);
      positions.forEach(position => notePositions[note.voice].add(position));
    });
    return notePositions;
  }

  private computeMasksFromEmptyRegions() {
    const notePositions = this.getPositionsPerVoice(editor.allNotes);
    const _masks = _.range(4).map(voice => {
      return _.range(TOTAL_SIXTEENTHS).filter(
        position => !notePositions[voice].has(position)
      );
    });
    return _masks;
  }

  @undoable('masks.maskNotes')
  maskNotes(notesInMask: Note[], replaceMask = true) {
    const notePositions = this.getPositionsPerVoice(notesInMask);
    notePositions.forEach((positions, voice) => {
      if (replaceMask) {
        this.setMask(voice, [...positions.values()]);
      } else {
        this.addMask(voice, [...positions.values()]);
      }
    });
  }

  beginDrawingMask() {
    undo.beginUndoable('masks.drawMask');
  }
  drawMask(voiceIndex: number, mask: IMask) {
    this._setMask(voiceIndex, mask);
  }
  endDrawingMask() {
    undo.completeUndoable('masks.drawMask');
  }

  @undoable('masks.setMask')
  setMask(voiceIndex: number, mask: IMask) {
    this._setMask(voiceIndex, mask);
  }

  _setMask(voiceIndex: number, mask: IMask) {
    this._userMasks[voiceIndex] = [...mask];
  }

  @undoable('masks.setMasks')
  setMasks(masks: IMasks) {
    this._userMasks = masks;
  }

  addMask(voiceIndex: number, mask: number[]) {
    const maskSet = new Set<number>(this._userMasks[voiceIndex]);
    mask.forEach(maskIndex => maskSet.add(maskIndex));
    this._userMasks[voiceIndex] = [...maskSet.values()].sort((a, b) => a - b);
  }

  removeMask(voiceIndex: number, mask: number[]) {
    const maskSet = new Set<number>(this._userMasks[voiceIndex]);
    mask.forEach(maskIndex => maskSet.delete(maskIndex));
    this._userMasks[voiceIndex] = [...maskSet.values()].sort((a, b) => a - b);
  }

  clearMasks() {
    this._userMasks = this.emptyMasks();
  }

  isNoteMasked(note: Note) {
    const { voice, start, end } = note;
    const masks = this.masks;
    const mask = masks[voice];

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

  addImplicitMasksToUserMasks() {
    this._implicitMasks.forEach((mask, voice) => {
      this.addMask(voice, mask);
    });
  }

  removeImplicitMasksFromUserMasks() {
    this._implicitMasks.forEach((mask, voice) => {
      this.removeMask(voice, mask);
    });
  }

  @computed get doUserMasksExist() {
    return _.some(this._userMasks, mask => mask.length > 0);
  }

  @computed get doImplicitMasksExist() {
    return _.some(this._implicitMasks, mask => mask.length > 0);
  }

  @computed get doAnyMasksExist() {
    return this.doUserMasksExist || this.doImplicitMasksExist;
  }
}

export default new Masks();
