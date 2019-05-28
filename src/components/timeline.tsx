import React from 'react';
import { observer } from 'mobx-react';

import { Group } from './group';

import { editor } from '../core';
import { DIVISIONS } from '../core/constants';

export interface Props {
  width: number;
  height: number;
}

@observer
export class Timeline extends React.Component<Props> {
  render() {
    const { width, height } = this.props;

    return (
      <Group>
        {DIVISIONS.map(divisionIndex => {
          const x = (width / editor.totalSixteenths) * divisionIndex;

          const isWhole = divisionIndex % 16 === 0;
          const isHalf = divisionIndex % 8 === 0;
          const y1 = isWhole ? 0 : isHalf ? height / 2 : height / 4;

          const color = isWhole ? '#494949' : '#555';
          const strokeWidth = isWhole ? 2 : 1;

          return (
            <line
              key={divisionIndex}
              x1={x}
              y1={y1}
              x2={x}
              y2={height}
              stroke={color}
              strokeWidth={strokeWidth}
            />
          );
        })}
      </Group>
    );
  }
}
