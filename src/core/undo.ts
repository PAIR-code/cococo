import { computed, observable } from 'mobx';

import { Note, SerializedNote } from './note';
import { editor } from './index';

export class Undo {
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

// export function undoable(getUndo: () => Undo) {
//   return function(
//     target: any,
//     propertyKey: string,
//     descriptor: PropertyDescriptor
//   ) {
//     const undo = getUndo();
//     const originalMethod = descriptor.value;
//     descriptor.value = function() {
//       undo.beginUndoable();
//       originalMethod.apply(this, arguments);
//       undo.completeUndoable();
//     };
//     return descriptor;
//   };
// }
