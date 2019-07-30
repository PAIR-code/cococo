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

import { editor, engine, interactions, layout } from '../core';
import { COLOR_PLAYING, COLOR_PRIMARY } from '../core/theme';

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
export class Timeline extends React.Component<Props> {
  render() {
    const { width, height } = this.props;

    const startX = (width / editor.totalSixteenths) * engine.loopStart - 1;
    const endX = (width / editor.totalSixteenths) * engine.loopEnd + 1;
    const caretWidth = layout.sixteenthWidth / 2;

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
          y={0}
          height={height}
          width={endX - startX}
          fill={COLOR_PLAYING}
          fillOpacity={0.1}
        />
        <polygon
          key="loopStart"
          points={toSVGPoints(startHandleCoordinates)}
          fill={COLOR_PLAYING}
          onMouseDown={interactions.handleLoopStartMouseDown}
        />
        <polygon
          key="loopEnd"
          points={toSVGPoints(endHandleCoordinates)}
          fill={COLOR_PLAYING}
          onMouseDown={interactions.handleLoopEndMouseDown}
        />
      </Group>
    );
  }
}
