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
import _ from 'lodash';

import logging, { Events } from './logging';
import { Note, SerializedNote } from './note';
import { NoteSequence } from './note-sequence';
import { editor, generator, masks } from './index';
import { IMasks } from './masks';

export interface UndoStep {
  notes: SerializedNote[];
  candidateNotes: SerializedNote[][];
  selectedCandidateIndex: number;
  masks: IMasks;
}

class Undo {
  @observable undoStack: UndoStep[] = [];
  @observable redoStack: UndoStep[] = [];

  private pendingUndoStep: UndoStep | null = null;
  private undoableNesting: string[] = [];
  private undoLocked = false;

  @computed get canUndo() {
    return this.undoStack.length > 0;
  }

  @computed get canRedo() {
    return this.redoStack.length > 0;
  }

  getSerializedNotes() {
    return editor.mainNotes.map(note => note.serialize());
  }

  getSerializedCandidateNotes() {
    return generator.candidateSequences.map(sequence => {
      return sequence.notes.map(note => note.serialize());
    });
  }

  getSerializedMasks() {
    // Create a copy of the masks to avoid mutation.
    return masks.userMasks.map(mask => [...mask]) as IMasks;
  }

  getUndoStep(): UndoStep {
    return {
      notes: this.getSerializedNotes(),
      candidateNotes: this.getSerializedCandidateNotes(),
      masks: this.getSerializedMasks(),
      selectedCandidateIndex: generator.selectedCandidateSequenceIndex,
    };
  }

  beginUndoable(label: string) {
    if (this.undoLocked) return;
    this.undoableNesting.push(label);
    if (this.pendingUndoStep) {
      return;
    }
    this.pendingUndoStep = this.getUndoStep();
  }

  completeUndoable(label: string) {
    if (this.undoLocked) return;

    const topLabel = this.undoableNesting.pop();
    if (label !== topLabel) {
      console.error(
        `Undoables of types ${label}, ${topLabel} completed in incorrect order `
      );
    }

    if (this.undoableNesting.length === 0) {
      this.undoStack.push(this.pendingUndoStep);
      this.redoStack = [];
      this.pendingUndoStep = null;
    }
  }

  private lockUndo() {
    this.undoLocked = true;
  }

  private unlockUndo() {
    this.undoLocked = false;
  }

  undo() {
    logging.logEvent(Events.UNDO);
    if (this.undoStack.length) {
      this.redoStack.push(this.getUndoStep());
      const lastStep = this.undoStack.pop();
      this.rehydrateStep(lastStep);
    }
  }

  redo() {
    logging.logEvent(Events.REDO);
    if (this.redoStack.length) {
      this.undoStack.push(this.getUndoStep());
      const lastStep = this.redoStack.pop();
      this.rehydrateStep(lastStep);
    }
  }

  private rehydrateStep(step: UndoStep) {
    this.lockUndo();
    const deserializedNotes = step.notes.map(note => Note.fromSerialized(note));
    editor.replaceAllNotes(deserializedNotes);

    const sequences = step.candidateNotes.map(serialized => {
      const sequence = new NoteSequence(
        serialized.map(note => Note.fromSerialized(note))
      );
      return sequence;
    });
    generator.setCandidateSequences(sequences);
    generator.selectedCandidateSequenceIndex = step.selectedCandidateIndex;
    masks.setMasks(step.masks);
    this.unlockUndo();
  }
}

const undo = new Undo();
export default undo;

export function undoable(label: string) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function() {
      undo.beginUndoable(label);
      originalMethod.apply(this, arguments);
      undo.completeUndoable(label);
    };
    return descriptor;
  };
}
