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
import { observer } from 'mobx-react';
import { style } from 'typestyle';

import { layout, Note } from '../core';
import { MUTED_COLOR, VOICE_COLORS, COLOR_SELECTED } from '../core/theme';

import { Group } from './group';
import { editor } from '../core';

export interface SequenceProps {
  notes: Note[];
  minPitch: number;
  maxPitch: number;
  minPosition: number;
  maxPosition: number;
  isSelected: boolean;
  onSelect: () => void;
  title: string;
}

const MIN_PITCH_RANGE = 12;
const MIN_POSITION_RANGE = 4;

@observer
export class Sequence extends React.Component<SequenceProps> {
  renderNotes() {
    const { minPitch, maxPitch, minPosition, maxPosition, notes } = this.props;
    const pitchRange = maxPitch - minPitch;
    const positionRange = maxPosition - minPosition;
    const paddingX = 4;
    const paddingY = 4;
    const height = layout.sequenceHeight - 4 * paddingY;
    const width = 100; // In percent

    const pitchHeight = height / Math.max(pitchRange, MIN_PITCH_RANGE);
    const sixteenthWidth = width / Math.max(positionRange, MIN_POSITION_RANGE);

    return (
      <Group x={paddingX} y={paddingY}>
        {notes.map(note => {
          const x = (note.position - minPosition) * sixteenthWidth;
          const y = height - (note.pitch - minPitch) * pitchHeight;
          const offsetY = y;
          const isMuted = editor.isVoiceMuted(note.voice);
          const color = isMuted ? MUTED_COLOR : VOICE_COLORS[note.voice];
          return (
            <rect
              key={note.id}
              x={`${x}%`}
              y={offsetY}
              height={pitchHeight}
              width={`${sixteenthWidth * note.duration}%`}
              fill={color}
            />
          );
        })}
      </Group>
    );
  }

  render() {
    const { isSelected, notes, onSelect } = this.props;
    const isEmpty = notes.length === 0;

    const border = isSelected
      ? `2px solid ${COLOR_SELECTED}`
      : '1px solid gray';

    const titleStyle = style({
      fontFamily: 'Roboto',
      backgroundColor: 'rgba(0,0,0,0.2)',
    });

    return (
      <svg
        width={'100%'}
        height={layout.sequenceHeight}
        style={{ border, marginBottom: 10, boxSizing: 'border-box' }}
        onClick={onSelect}
      >
        {!isEmpty && this.renderNotes()}
        <text x={6} y={20} className={titleStyle}>
          {this.props.title}
        </text>
      </svg>
    );
  }
}
