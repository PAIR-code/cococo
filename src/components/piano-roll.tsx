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

import { editor, engine } from '../core';
import { COLOR_PLAYING } from '../core/theme';
import { ScaleValue } from '../core/editor';
import { Note } from '../core/note';

export interface Props {
  width: number;
  height: number;
  noteHeight: number;
}

@observer
export class PianoRoll extends React.Component<Props> {
  renderKey(scaleNote: ScaleValue, index: number) {
    const { width, noteHeight } = this.props;
    const y = noteHeight * index;

    const isActive = editor.activeNoteValue === scaleNote.pitch;
    const isWhite = scaleNote.name.length === 2;
    let fill = isWhite ? 'white' : 'black';

    fill = isActive ? COLOR_PLAYING : fill;
    const fadeDuration = isActive ? 0 : 0.5;

    const rectStyle = style({
      transition: `fill ${fadeDuration}s`,
      fill,
      stroke: '#CCC',
      strokeWidth: 1,
    });

    return (
      <rect
        key={index}
        className={rectStyle}
        x={0}
        y={y}
        width={width}
        height={noteHeight}
        onMouseDown={e => {
          e.preventDefault();
          const note = new Note(scaleNote.pitch, 0, 0.2);
          engine.playNoteDown(note);

          const mouseup = () => {
            engine.playNoteUp(note);
          };
          document.addEventListener('mouseup', mouseup);
        }}
      />
    );
  }

  render() {
    const { width } = this.props;

    return (
      <g
        y={0}
        width={width}
        onMouseEnter={() => {
          document.body.style.cursor = 'pointer';
        }}
        onMouseLeave={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {editor.scale.map((scaleNote: ScaleValue, index: number) => {
          return this.renderKey(scaleNote, index);
        })}
      </g>
    );
  }
}
