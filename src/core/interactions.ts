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

import React from 'react';
import _ from 'lodash';
import { observable } from 'mobx';
import { EditorTool, editor, generator, masks, player, layout } from './index';
import { MAX_PITCH, MIN_PITCH } from './constants';
import logging, { Events } from './logging';
import { Note, Source } from './note';
import featureFlags from './feature-flags';

/**
 * @param position position in sixteenths
 * @param quantizeFn Math.round for nearest, Math.floor for previous
 */
function quantizePosition(position: number, quantizeFn = Math.round) {
  return quantizeFn(position / editor.quantizeStep) * editor.quantizeStep;
}

function getQuantizedPositionFromX(x: number) {
  const width = layout.notesWidth;
  const position = Math.floor((x / width) * editor.totalSixteenths);
  return quantizePosition(clampPosition(position), Math.floor);
}

function clampPosition(position: number, endPosition = false) {
  return _.clamp(position, 0, editor.totalSixteenths - (endPosition ? 0 : 1));
}

function clampPitch(pitch: number) {
  return _.clamp(pitch, MIN_PITCH, MAX_PITCH);
}

class Interactions {
  constructor() {
    const { baseline } = featureFlags;
    this.emptyMaskDeselectsAll = baseline ? true : false;
  }

  /**
   * Note Interactions
   * ===========================================================================
   */
  private noteDragStartX = 0;
  private noteDragStartY = 0;
  private noteDragStartPosition = 0;
  private noteDragStartPitch = 0;

  handleNoteHover = (note: Note) => (e: React.MouseEvent) => {
    if (this.isEraseToolDragging) {
      editor.removeNote(note);
    }
  };

  // TODO: Let's make this a more reasonable system - position drag is disabled
  // for now because of overlapping voice
  private handleNoteDrag = (note: Note) => (e: MouseEvent) => {
    const deltaX = e.clientX - this.noteDragStartX;
    const deltaY = e.clientY - this.noteDragStartY;

    const deltaPosition = Math.floor(deltaX / layout.sixteenthWidth);
    const deltaPitch = Math.floor(deltaY / layout.noteHeight);

    const deltaQuantized = quantizePosition(deltaPosition);
    const nextPosition = clampPosition(
      this.noteDragStartPosition + deltaQuantized
    );
    const nextPitch = clampPitch(this.noteDragStartPitch - deltaPitch);
    const isInScale = editor.isPitchInScale(nextPitch);
    const canMoveNote = editor.constrainToKey ? isInScale : true;

    if (!canMoveNote) return;
    if (nextPosition !== note.position || nextPitch !== note.pitch) {
      // Disabled temporarily until we sort out the way to handle note overlaps
      // note.position = nextPosition;
      note.pitch = nextPitch;
      player.playNote(note);
    }
  };

  handleStartNoteDrag(note: Note, e: React.MouseEvent) {
    editor.startNoteDrag();
    e.preventDefault();

    this.noteDragStartX = e.clientX;
    this.noteDragStartY = e.clientY;
    this.noteDragStartPosition = note.position;
    this.noteDragStartPitch = note.pitch;

    const mouseMove = this.handleNoteDrag(note);
    const mouseUp = () => {
      editor.endNoteDrag(note);
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  }

  handleNoteMouseDown = (note: Note) => (e: React.MouseEvent) => {
    if (editor.selectedTool === EditorTool.ERASE) {
      editor.removeNote(note);
    } else if (editor.selectedTool === EditorTool.DRAW) {
      this.handleStartNoteDrag(note, e);
    }
  };

  /**
   * Loop Interactions
   * ===========================================================================
   */
  private loopStartDragStartX = 0;
  private loopEndDragStartX = 0;
  private loopStartDragStartPosition = 0;
  private loopEndDragStartPosition = 0;

  private handleLoopStartDrag = (e: MouseEvent) => {
    const deltaX = e.clientX - this.loopStartDragStartX;

    const deltaPosition = Math.floor(deltaX / layout.sixteenthWidth);

    const deltaQuantized = quantizePosition(deltaPosition);
    const nextPosition = clampPosition(
      this.loopStartDragStartPosition + deltaQuantized,
      true
    );

    if (nextPosition !== player.loopStart && nextPosition < player.loopEnd) {
      player.loopStart = nextPosition;
    }
  };

  private handleLoopEndDrag = (e: MouseEvent) => {
    const deltaX = e.clientX - this.loopEndDragStartX;

    const deltaPosition = Math.floor(deltaX / layout.sixteenthWidth);

    const deltaQuantized = quantizePosition(deltaPosition);
    const nextPosition = clampPosition(
      this.loopEndDragStartPosition + deltaQuantized,
      true
    );

    if (nextPosition !== player.loopEnd && nextPosition > player.loopStart) {
      player.loopEnd = nextPosition;
    }

    logging.logEvent(Events.CHANGE_LOOP, [player.loopStart, player.loopEnd]);
  };

  handleLoopStartMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    this.loopStartDragStartX = e.clientX;
    this.loopStartDragStartPosition = player.loopStart;

    const mouseMove = this.handleLoopStartDrag;
    const mouseUp = () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  handleLoopEndMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    this.loopEndDragStartX = e.clientX;
    this.loopEndDragStartPosition = player.loopEnd;

    const mouseMove = this.handleLoopEndDrag;
    const mouseUp = () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  /**
   * Grid Interactions
   * ===========================================================================
   */

  handleGridClick(scaleIndex: number, divisionIndex: number) {
    if (editor.selectedTool !== EditorTool.DRAW) {
      return;
    }

    const value = editor.getPitchFromScaleIndex(scaleIndex);
    const position = divisionIndex * editor.quantizeStep;
    const duration = editor.quantizeStep;
    const note = new Note(value, position, duration);

    editor.addNote(note);
    player.playNote(note);
  }

  @observable isMaskToolDragging = false;
  @observable isEraseToolDragging = false;
  @observable isDrawToolDragging = false;

  private gridBounds: DOMRect;

  private handleDrawMouseDown = (
    scaleIndex: number,
    divisionIndex: number,
    e: React.MouseEvent
  ) => {
    const pitch = editor.getPitchFromScaleIndex(scaleIndex);
    const voice = editor.selectedVoice;
    const position = divisionIndex * editor.quantizeStep;
    const duration = editor.quantizeStep;

    if (editor.constrainToKey) {
      if (!editor.isPitchInScale(pitch)) return;
    }

    const note = new Note(pitch, position, duration, Source.USER, voice);
    const editorGrid = document.getElementById('editor-grid')!;
    this.gridBounds = editorGrid.getBoundingClientRect() as DOMRect;

    editor.beginDrawingNote(note);
    player.playNote(note);
  };

  handleDrawMouseMove = (e: MouseEvent) => {
    const noteBeingDrawn = editor.noteBeingDrawn;
    if (!noteBeingDrawn) {
      return;
    }
    const gridX = e.clientX - this.gridBounds.x;
    const gridPosition = getQuantizedPositionFromX(gridX);

    const shouldUpdateDrawn =
      gridPosition >= noteBeingDrawn.position &&
      gridPosition + editor.quantizeStep !== noteBeingDrawn.end;
    if (shouldUpdateDrawn) {
      noteBeingDrawn.moveEnd(gridPosition + editor.quantizeStep);
      editor.trimNoteBeingDrawnSequence(); // Trims overlapping notes in the sequence
    }
  };

  handleGridMouseDown = (scaleIndex: number, divisionIndex: number) => (
    e: React.MouseEvent
  ) => {
    let toolMouseUp: () => void = () => {};
    let mouseMove: (e: MouseEvent) => void = () => {};

    if (editor.selectedTool === EditorTool.ERASE) {
      this.isEraseToolDragging = true;
      toolMouseUp = () => (this.isEraseToolDragging = false);
    } else if (editor.selectedTool === EditorTool.DRAW) {
      this.isDrawToolDragging = true;
      toolMouseUp = () => {
        this.isDrawToolDragging = false;
        editor.endDrawingNote();
      };
      this.handleDrawMouseDown(scaleIndex, divisionIndex, e);
      mouseMove = this.handleDrawMouseMove;
    }

    const mouseUp = () => {
      toolMouseUp();
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  /**
   * Mask Tool Interactions
   * ===========================================================================
   */
  private maskToolDragStartClientXY = [0, 0];
  @observable maskToolDragStartXY = [0, 0];
  @observable maskToolDragXY = [0, 0];
  private maskToolShiftDrag = false;
  private emptyMaskDeselectsAll = false; // To be set in baseline mode

  handleMaskToolDrag = (e: MouseEvent) => {
    this.maskToolDragXY = [
      e.clientX -
        this.maskToolDragStartClientXY[0] +
        this.maskToolDragStartXY[0],
      e.clientY -
        this.maskToolDragStartClientXY[1] +
        this.maskToolDragStartXY[1],
    ];
  };

  handleMaskToolMouseDown = (e: React.MouseEvent<SVGRectElement>) => {
    e.preventDefault();
    this.maskToolShiftDrag = e.shiftKey;
    const target = e.target as SVGRectElement;
    const dim = target.getBoundingClientRect();
    this.maskToolDragStartXY = [e.clientX - dim.left, e.clientY - dim.top];
    this.maskToolDragXY = [e.clientX - dim.left, e.clientY - dim.top];
    this.maskToolDragStartClientXY = [e.clientX, e.clientY];

    this.isMaskToolDragging = true;

    const mouseUp = () => {
      let [aX, aY] = this.maskToolDragStartXY;
      const [bX, bY] = this.maskToolDragXY;
      const startX = aX <= bX ? aX : bX;
      const startY = aY <= bY ? aY : bY;
      const endX = aX > bX ? aX : bX;
      const endY = aY > bY ? aY : bY;

      const positionRange = [
        quantizePosition(startX / layout.sixteenthWidth, Math.floor),
        quantizePosition(endX / layout.sixteenthWidth, Math.ceil),
      ];
      const pitchRange = [
        MAX_PITCH - Math.floor(endY / layout.noteHeight),
        MAX_PITCH - Math.floor(startY / layout.noteHeight),
      ];

      const notesInRange = editor.getNotesInRange(positionRange, pitchRange);
      if (notesInRange.length === 0 && this.emptyMaskDeselectsAll) {
        masks.clearMasks();
      } else {
        const replaceMask = !this.maskToolShiftDrag;
        masks.maskNotes(notesInRange, replaceMask);
      }

      logging.logEvent(Events.USE_MASK_TOOL, masks.masks);

      this.isMaskToolDragging = false;
      this.maskToolDragStartClientXY = [0, 0];
      this.maskToolDragStartXY = [0, 0];
      this.maskToolDragXY = [0, 0];
      this.maskToolShiftDrag = false;
      document.removeEventListener('mousemove', this.handleMaskToolDrag);
      document.removeEventListener('mouseup', mouseUp);
    };
    document.addEventListener('mousemove', this.handleMaskToolDrag);
    document.addEventListener('mouseup', mouseUp);
  };

  /**
   * Mask Lane Interactions
   * ===========================================================================
   */
  private maskLaneDragStartX = 0;
  private maskLaneDragX = 0;
  private maskLaneDragStartClientX = 0;
  private hasMaskDragMoved = false;

  handleMaskLaneMouseDown = voiceIndex => (
    e: React.MouseEvent<SVGRectElement>
  ) => {
    e.preventDefault();
    const editorGrid = document.getElementById('editor-grid')!;
    const dim = editorGrid.getBoundingClientRect() as DOMRect;

    this.maskLaneDragStartX = e.clientX - dim.left;
    this.maskLaneDragX = e.clientX - dim.left;
    this.maskLaneDragStartClientX = e.clientX;
    this.hasMaskDragMoved = false;

    masks.beginDrawingMask();

    const mouseMove = (e: MouseEvent) => {
      this.maskLaneDragX =
        e.clientX - this.maskLaneDragStartClientX + this.maskLaneDragStartX;
      const deltaX = this.maskLaneDragStartX - this.maskLaneDragX;
      if (deltaX !== 0) {
        this.hasMaskDragMoved = true;
      }

      let aX = this.maskLaneDragStartX;
      const bX = this.maskLaneDragX;
      const startX = aX <= bX ? aX : bX;
      const endX = aX > bX ? aX : bX;

      const startPosition = clampPosition(
        quantizePosition(startX / layout.sixteenthWidth, Math.floor),
        true
      );
      const endPosition = clampPosition(
        quantizePosition(endX / layout.sixteenthWidth, Math.ceil),
        true
      );

      masks.drawMask(voiceIndex, _.range(startPosition, endPosition));
    };

    const mouseUp = () => {
      if (!this.hasMaskDragMoved) {
        const { loopStart, loopEnd } = player;
        masks.drawMask(voiceIndex, _.range(loopStart, loopEnd));
      }

      logging.logEvent(Events.USE_MASK_LANE, masks.masks);
      masks.endDrawingMask();
      this.hasMaskDragMoved = false;
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    };

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  };

  handleMaskRectClick = (
    voiceIndex: number,
    maskIndices: number[],
    pendingCandidateSequences = false
  ) => () => {
    if (!this.hasMaskDragMoved) {
      if (pendingCandidateSequences) {
        generator.commitSelectedCandidateSequence();
      } else {
        masks.removeMask(voiceIndex, maskIndices);
      }
    }
  };
}

export default new Interactions();
