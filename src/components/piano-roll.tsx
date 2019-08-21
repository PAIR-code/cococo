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

import { editor, player } from '../core';
import { COLOR_PLAYING, COLOR_SECONDARY, COLOR_PRIMARY } from '../core/theme';
import { ScaleValue } from '../core/editor';
import logging, { Events } from '../core/logging';
import { Note } from '../core/note';
import blue from '@material-ui/core/colors/blue';

import { Group } from './group';

export interface Props {
  width: number;
  height: number;
  noteHeight: number;
}

@observer
export class PianoRoll extends React.Component<Props> {
  render() {
    const { noteHeight, width } = this.props;

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
        {editor.scale.map((scaleValue: ScaleValue, index: number) => {
          const keyProps = { scaleValue, index, height: noteHeight, width };
          return <Key {...keyProps} />;
        })}
      </g>
    );
  }
}

interface KeyProps {
  scaleValue: ScaleValue;
  index: number;
  width: number;
  height: number;
}

@observer
class Key extends React.Component<KeyProps> {
  render() {
    const { width, height, index, scaleValue } = this.props;
    const y = height * index;

    const isActive = editor.activeNoteValue === scaleValue.pitch;
    const isWhite = scaleValue.name.length === 1;
    let fill = isWhite ? 'white' : 'black';

    fill = isActive ? COLOR_PLAYING : fill;
    const fadeDuration = isActive ? 0 : 0.5;

    const rectStyle = style({
      transition: `fill ${fadeDuration}s`,
      fill,
      stroke: '#CCC',
      strokeWidth: 1,
    });

    const isInScale = editor.isPitchInScale(scaleValue.pitch);
    const isRoot = editor.key === scaleValue.name;
    const highlightFill = isRoot ? blue[600] : blue[200];
    const highlightSize = 5;

    return (
      <Group x={0} y={y}>
        <rect
          key={index}
          className={rectStyle}
          width={width}
          height={height}
          onMouseDown={e => {
            e.preventDefault();
            const note = new Note(scaleValue.pitch, 0, 0.2);
            player.playNoteDown(note);

            const mouseup = () => {
              player.playNoteUp(note);
            };
            document.addEventListener('mouseup', mouseup);
            logging.logEvent(Events.PRESS_PIANOROLL);
          }}
          onMouseEnter={() => {
            editor.setNoteHoverName(scaleValue);
          }}
        />
        {isInScale && (
          <rect
            x={width - highlightSize}
            y={0}
            width={highlightSize}
            height={height}
            fill={highlightFill}
          />
        )}
      </Group>
    );
  }
}
