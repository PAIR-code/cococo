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

import { Note, SerializedNote } from './note';
import { editor } from './index';

class Undo {
  @observable undoStack: SerializedNote[][] = [];
  @observable redoStack: SerializedNote[][] = [];

  private pendingUndoStep: SerializedNote[] | null = null;
  private undoableNesting = 0;

  @computed get canUndo() {
    return this.undoStack.length > 0;
  }

  @computed get canRedo() {
    return this.redoStack.length > 0;
  }

  getSerializedNotes() {
    return editor.allNotes.map(note => note.serialize());
  }

  beginUndoable() {
    this.undoableNesting += 1;
    if (this.pendingUndoStep) {
      console.warn('Pending undo step already present...');
      return;
    }
    this.pendingUndoStep = this.getSerializedNotes();
  }

  completeUndoable() {
    this.undoableNesting -= 1;
    if (this.undoableNesting < 0) {
      console.error(
        'Called completeUndoable() more times than corresponding beginUndoable()'
      );
    }

    if (this.undoableNesting === 0) {
      this.undoStack.push(this.pendingUndoStep);
      this.redoStack = [];
      this.pendingUndoStep = null;
    }
  }

  undo() {
    if (this.undoStack.length) {
      this.redoStack.push(this.getSerializedNotes());
      const lastStep = this.undoStack.pop();
      const deserializedNotes = lastStep.map(note => Note.fromSerialized(note));
      editor.replaceAllNotes(deserializedNotes);
    }
  }

  redo() {
    if (this.redoStack.length) {
      this.undoStack.push(this.getSerializedNotes());
      const lastStep = this.redoStack.pop();
      const deserializedNotes = lastStep.map(note => Note.fromSerialized(note));
      editor.replaceAllNotes(deserializedNotes);
    }
  }
}

const undo = new Undo();
export default undo;

export function undoable() {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function() {
      undo.beginUndoable();
      originalMethod.apply(this, arguments);
      undo.completeUndoable();
    };
    return descriptor;
  };
}
