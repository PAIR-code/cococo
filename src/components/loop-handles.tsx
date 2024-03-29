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

import { Group } from './group';

import { editor, player, interactions, layout } from '../core';
import { COLOR_TIMELINE_RANGE, COLOR_TIMELINE_HANDLE } from '../core/theme';

export interface Props {
  width: number;
  height: number;
}

function toSVGPoints(coordinates: number[][]) {
  return coordinates
    .map(coord => {
      return coord.join(',');
    })
    .join(' ');
}

@observer
export class LoopHandles extends React.Component<Props> {
  render() {
    const { width, height } = this.props;

    const startX = (width / editor.totalSixteenths) * player.loopStart;
    const endX = (width / editor.totalSixteenths) * player.loopEnd;
    const caretWidth = layout.sixteenthWidth / 2;
    const lineHeight = 3;
    const startHandleCoordinates: number[][] = [
      [startX, 0],
      [startX + caretWidth, height / 2],
      [startX, height],
    ];

    const endHandleCoordinates: number[][] = [
      [endX, 0],
      [endX - caretWidth, height / 2],
      [endX, height],
    ];

    return (
      <Group>
        <rect
          key="loopRegion"
          x={startX}
          y={height / 2 - 1}
          height={lineHeight}
          width={endX - startX}
          fill={COLOR_TIMELINE_RANGE}
        />

        <polygon
          key="loopStart"
          points={toSVGPoints(startHandleCoordinates)}
          fill={COLOR_TIMELINE_HANDLE}
          onMouseDown={interactions.handleLoopStartMouseDown}
        />
        <polygon
          key="loopEnd"
          points={toSVGPoints(endHandleCoordinates)}
          fill={COLOR_TIMELINE_HANDLE}
          onMouseDown={interactions.handleLoopEndMouseDown}
        />
      </Group>
    );
  }
}
