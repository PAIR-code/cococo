import React from 'react';
import { observer } from 'mobx-react';

import { Group } from './group';

import { editor, engine } from '../core';
import { DIVISIONS } from '../core/constants';

export interface Props {
  width: number;
  height: number;
}

@observer
export class Timeline extends React.Component<Props> {
  render() {
    const { width, height } = this.props;

    const startX = (width / editor.totalSixteenths) * engine.loopStart;
    const endX = (width / editor.totalSixteenths) * engine.loopEnd - 1;
    const color = 'black';
    const strokeWidth = 2;

    return (
      <Group>
        <line
          key="loopStart"
          x1={startX}
          y1={0}
          x2={startX}
          y2={height}
          stroke={color}
          strokeWidth={strokeWidth}
        />

        <line
          key="loopEnd"
          x1={endX}
          y1={0}
          x2={endX}
          y2={height}
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </Group>
    );
  }
}
