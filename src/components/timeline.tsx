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
