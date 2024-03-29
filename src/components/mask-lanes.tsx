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
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { editor, generator, interactions, masks, layout } from '../core';
import { VOICE_COLORS, MUTED_COLOR, COLOR_PRIMARY } from '../core/theme';

import { Group } from './group';

export interface Props {
  width: number;
  height: number;
  labelWidth: number;
}

const VOICE_INITIALS = ['S', 'A', 'T', 'B'];

@observer
export class MaskLanes extends React.Component<Props> {
  renderLabels() {
    const { height, labelWidth } = this.props;

    return _.range(4).map(voiceIndex => {
      const laneHeight = height / 4;
      const y = voiceIndex * laneHeight;
      const isMuted = editor.isVoiceMuted(voiceIndex);
      const color = isMuted ? MUTED_COLOR : VOICE_COLORS[voiceIndex];
      return (
        <g
          key={`label_${voiceIndex}`}
          className="mask-lane-label"
          onClick={(e: React.MouseEvent<SVGGElement>) => {
            editor.toggleVoiceMute(voiceIndex);
          }}
        >
          <rect
            x={1}
            y={y + 1}
            height={laneHeight - 2}
            width={labelWidth - 2}
            fillOpacity={0}
            stroke={COLOR_PRIMARY}
            strokeWidth={0.5}
            rx="3"
          />
          <text
            x={layout.pianoRollWidth / 2 - 6}
            y={y + 16}
            height={laneHeight}
            width={labelWidth}
            fill={color}
          >
            {VOICE_INITIALS[voiceIndex]}
          </text>
        </g>
      );
    });
  }

  renderLanes() {
    const { height, width } = this.props;
    const laneHeight = height / 4;

    return _.range(4).map(voiceIndex => {
      const y = voiceIndex * laneHeight;
      const isMuted = editor.isVoiceMuted(voiceIndex);
      const color = isMuted ? MUTED_COLOR : VOICE_COLORS[voiceIndex];

      const candidateSequencesExist = generator.candidateSequences.length > 0;
      const mouseDownHandler = interactions.handleMaskLaneMouseDown(
        voiceIndex,
        candidateSequencesExist
      );

      return (
        <rect
          key={`lane_${voiceIndex}`}
          x={0}
          y={y}
          height={laneHeight}
          width={width}
          fill={color}
          fillOpacity={candidateSequencesExist ? 0.6 : 1}
          onMouseDown={mouseDownHandler}
        />
      );
    });
  }

  renderMasks() {
    const { height, width } = this.props;
    const laneHeight = height / 4;

    return _.range(4).map(voiceIndex => {
      const mask = masks.userMasks[voiceIndex];
      const y = voiceIndex * laneHeight;

      // Merge the mask indices into left/right bounds in order to draw
      // contiguous rectangles for masked regions.
      type Bound = { start: number; end: number };
      const maskBounds: Bound[] = [];

      let currentBound: Bound | null = null;
      mask.forEach((maskIndex, arrIndex) => {
        const neighborLeft =
          arrIndex > 0 && mask[arrIndex - 1] === maskIndex - 1;

        if (!currentBound || !neighborLeft) {
          currentBound = { start: maskIndex, end: maskIndex };
          maskBounds.push(currentBound);
          return;
        } else {
          currentBound.end = maskIndex;
        }
      });

      return maskBounds.map((bounds, boundsIndex) => {
        const BORDER = 2;

        const x = (width / editor.totalSixteenths) * bounds.start;
        const rectWidth =
          (width / editor.totalSixteenths) * (bounds.end - bounds.start + 1);
        const maskIndices = _.range(bounds.start, bounds.end + 1);

        const candidateSequencesExist = generator.candidateSequences.length > 0;

        const clickHandler = interactions.handleMaskRectClick(
          voiceIndex,
          maskIndices,
          candidateSequencesExist
        );

        const isMuted = editor.isVoiceMuted(voiceIndex);
        const color = isMuted ? MUTED_COLOR : VOICE_COLORS[voiceIndex];

        return (
          <>
            {candidateSequencesExist ? (
              <rect
                x={x}
                y={y}
                height={laneHeight}
                width={rectWidth}
                fill={color}
              />
            ) : null}
            <rect
              key={`lane_${voiceIndex}_mask_${boundsIndex}`}
              x={x + BORDER}
              y={y + BORDER}
              height={laneHeight - 2 * BORDER}
              width={rectWidth - 2 * BORDER}
              stroke={'white'}
              strokeWidth={2}
              fill={`url(#diagonal-stripe)`}
              fillOpacity={0.75}
              onClick={clickHandler}
              cursor={candidateSequencesExist ? 'pointer' : 'default'}
            />
          </>
        );
      });
    });
  }

  render() {
    const { labelWidth } = this.props;

    return (
      <Group>
        {this.renderLabels()}
        <Group x={labelWidth}>{this.renderLanes()}</Group>
        <Group x={labelWidth}>{this.renderMasks()}</Group>
      </Group>
    );
  }
}
