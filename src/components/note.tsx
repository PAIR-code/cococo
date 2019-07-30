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
import { style } from 'typestyle';
import { observer } from 'mobx-react';

import { Note as NoteModel } from '../core/note';
import { interactions } from '../core';
import { COLOR_PLAYING, COLOR_SELECTED, VOICE_COLORS } from '../core/theme';

function getFillColor(note: NoteModel) {
  const { isSelected, isPlaying } = note;
  if (isPlaying) {
    return COLOR_PLAYING;
  } else if (isSelected) {
    return COLOR_SELECTED;
  } else {
    return VOICE_COLORS[note.voice];
  }
}

export interface NoteProps {
  note: NoteModel;
  height: number;
  width: number;
  x: number;
  y: number;
}

const NOTE_BORDER = 1;

@observer
export class Note extends React.Component<NoteProps> {
  render() {
    const { note, width, height, x, y } = this.props;
    const fill = getFillColor(note);

    const fadeDuration = note.isPlaying ? 0 : 0.5;

    const rectStyle = style({
      transition: `fill ${fadeDuration}s`,
      fill,
      opacity: note.isMasked ? 0.3 : 1,
      stroke: '#ddd',
      strokeWidth: 1,
    });

    return (
      <rect
        key={note.id}
        className={rectStyle}
        x={x + 1}
        y={y + NOTE_BORDER}
        width={width - 2 * NOTE_BORDER}
        height={height - 2 * NOTE_BORDER}
        onMouseDown={interactions.handleNoteMouseDown(note)}
        onMouseMove={interactions.handleNoteHover(note)}
      />
    );
  }
}
