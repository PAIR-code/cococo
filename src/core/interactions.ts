import React from 'react';
import _ from 'lodash';
import { observable } from 'mobx';
import { EditorTool, Note, editor, engine, layout } from './index';
import { MAX_PITCH, MIN_PITCH } from './constants';

function quantizePosition(position: number) {
  return Math.round(position / editor.quantizeStep) * editor.quantizeStep;
}

function clampPosition(position: number) {
  return _.clamp(position, editor.totalSixteenths - 1);
}

function clampPitch(pitch: number) {
  return _.clamp(pitch, MIN_PITCH, MAX_PITCH);
}

export class Interactions {
  private noteDragStartX = 0;
  private noteDragStartY = 0;
  private noteDragStartPosition = 0;
  private noteDragStartPitch = 0;

  private handleNoteDrag = (note: Note) => (e: MouseEvent) => {
    const deltaX = e.clientX - this.noteDragStartX;
    const deltaY = e.clientY - this.noteDragStartY;

    const deltaPosition = Math.floor(deltaX / layout.sixteenthWidth);
    const deltaPitch = Math.floor(deltaY / layout.noteHeight);

    const deltaQuantized = quantizePosition(deltaPosition);
    const nextPosition = clampPosition(
      this.noteDragStartPosition + deltaQuantized
    );
    const nextValue = clampPitch(this.noteDragStartPitch - deltaPitch);

    if (nextPosition !== note.position || nextValue !== note.value) {
      note.position = nextPosition;
      note.value = nextValue;
      engine.playNote(note);
    }
  };

  handleNoteMouseDown = (note: Note) => (e: React.MouseEvent) => {
    e.preventDefault();

    this.noteDragStartX = e.clientX;
    this.noteDragStartY = e.clientY;
    this.noteDragStartPosition = note.position;
    this.noteDragStartPitch = note.value;

    const mouseMove = this.handleNoteDrag(note);
    const mouseUp = () => {
      editor.endNoteDrag(note);
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  handleGridClick(scaleIndex: number, divisionIndex: number) {
    if (editor.selectedTool !== EditorTool.DRAW) {
      return;
    }

    const value = editor.getValueFromScaleIndex(scaleIndex);
    const position = divisionIndex * editor.quantizeStep;
    const duration = editor.quantizeStep;
    const note = new Note(value, position, duration);

    editor.addNote(note);
    engine.playNote(note);
  }

  @observable isMaskDragging = false;
  private maskDragStartClientXY = [0, 0];
  @observable maskDragStartXY = [0, 0];
  @observable maskDragXY = [0, 0];

  handleMaskDrag = (e: MouseEvent) => {
    this.maskDragXY = [
      e.clientX - this.maskDragStartClientXY[0] + this.maskDragStartXY[0],
      e.clientY - this.maskDragStartClientXY[1] + this.maskDragStartXY[1],
    ];
  };

  handleMaskMouseDown = (e: React.MouseEvent<SVGRectElement>) => {
    e.preventDefault();
    const target = e.target as SVGRectElement;
    const dim = target.getBoundingClientRect();
    this.maskDragStartXY = [e.clientX - dim.left, e.clientY - dim.top];
    this.maskDragXY = [e.clientX - dim.left, e.clientY - dim.top];
    this.maskDragStartClientXY = [e.clientX, e.clientY];

    this.isMaskDragging = true;

    const mouseUp = () => {
      let [aX, aY] = this.maskDragStartXY;
      const [bX, bY] = this.maskDragXY;
      const startX = aX <= bX ? aX : bX;
      const startY = aY <= bY ? aY : bY;
      const endX = aX > bX ? aX : bX;
      const endY = aY > bY ? aY : bY;

      const positionRange = [
        Math.floor(startX / layout.sixteenthWidth),
        Math.ceil(endX / layout.sixteenthWidth),
      ];
      const valueRange = [
        MAX_PITCH - Math.floor(endY / layout.noteHeight),
        MAX_PITCH - Math.floor(startY / layout.noteHeight),
      ];

      editor.maskNotes(positionRange, valueRange);

      this.isMaskDragging = false;
      this.maskDragStartClientXY = [0, 0];
      this.maskDragStartXY = [0, 0];
      this.maskDragXY = [0, 0];
      document.removeEventListener('mousemove', this.handleMaskDrag);
      document.removeEventListener('mouseup', mouseUp);
    };
    document.addEventListener('mousemove', this.handleMaskDrag);
    document.addEventListener('mouseup', mouseUp);
  };
}
