import React from 'react';
import { observer } from 'mobx-react';

import { engine, editor } from '../core';

import { Group } from './group';
import { COLOR_PLAYING } from '../core/theme';

export interface Props {
  width: number;
  height: number;
}

@observer
export class LoopOverlay extends React.Component<Props> {
  render() {
    const { width, height } = this.props;
    const startX = (width / editor.totalSixteenths) * engine.loopStart - 1;
    const endX = (width / editor.totalSixteenths) * engine.loopEnd - 1;

    return (
      <Group>
        <rect
          key="loop-border-left"
          x={0}
          y={0}
          height={height}
          width={startX}
          fill={'black'}
          fillOpacity={0.1}
        />
        <rect
          key="loop-border-right"
          x={endX}
          y={0}
          height={height}
          width={width - endX}
          fill={'black'}
          fillOpacity={0.1}
        />
      </Group>
    );
  }
}
