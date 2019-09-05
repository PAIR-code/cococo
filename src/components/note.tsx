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
import { Rect } from 'react-konva';

import { Note as NoteModel } from '../core/note';
import { EditorTool } from '../core/editor';
import { editor, interactions, masks } from '../core';
import { VOICES } from '../core/constants';
import { COLOR_PLAYING, VOICE_COLORS, MUTED_COLOR } from '../core/theme';

function getFillColor(note: NoteModel, isMuted: boolean) {
  const { isPlaying } = note;
  if (isMuted) {
    return MUTED_COLOR;
  } else if (isPlaying) {
    return COLOR_PLAYING;
  } else {
    return VOICE_COLORS[note.voice];
  }
}

export interface NoteProps {
  note: NoteModel;
  isMuted: boolean;
  height: number;
  width: number;
  x: number;
  y: number;
}

const NOTE_BORDER = 1;

@observer
export class Note extends React.Component<NoteProps> {
  render() {
    const { isMuted, note, width, height, x, y } = this.props;
    const fill = getFillColor(note, isMuted);

    const fadeDuration = note.isPlaying ? 0 : 0.5;

    const rectStyle = style({
      transition: `fill ${fadeDuration}s`,
      fill,
      stroke: '#ddd',
      strokeWidth: 1,
      cursor:
        editor.selectedTool === EditorTool.ERASE ? 'context-menu' : 'default',
    });

    const VOICE = VOICES[note.voice];
    const glowFilter = `url(#glow-${VOICE.toLowerCase()})`;

    const isMasked = masks.isNoteMasked(note);
    const filter = isMasked ? glowFilter : null;

    const sizeProps = {
      x: x + 1,
      y: y + NOTE_BORDER,
      width: width - 2 * NOTE_BORDER,
      height: height - 2 * NOTE_BORDER,
    };

    return (
      <>
        {/* <Rect key={`${note.id}-glow`} filter={filter} {...sizeProps} /> */}
        <Rect
          key={note.id}
          className={rectStyle}
          {...sizeProps}
          height={height - 2 * NOTE_BORDER}
          onMouseDown={e => interactions.handleNoteMouseDown(note)(e.evt)}
          onMouseMove={e => interactions.handleNoteHover(note)(e.evt)}
        />
      </>
    );
  }
}
