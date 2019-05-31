import React from 'react';
import { observer } from 'mobx-react';

import { interactions, editor } from '../core';

import { Group } from './group';

export interface NotesProps {
  height: number;
  width: number;
}

@observer
export class Masks extends React.Component<NotesProps> {
  renderDragRect() {
    const { maskDragStartXY, maskDragXY } = interactions;
    const maskDragWidth = maskDragXY[0] - maskDragStartXY[0];
    const maskDragHeight = maskDragXY[1] - maskDragStartXY[1];

    const x = maskDragWidth >= 0 ? maskDragStartXY[0] : maskDragXY[0];
    const y = maskDragHeight >= 0 ? maskDragStartXY[1] : maskDragXY[1];
    const width = Math.abs(maskDragWidth);
    const height = Math.abs(maskDragHeight);

    const style = {
      stroke: '#AAAAAA',
      strokeWidth: 2,
      strokeDasharray: '10 5',
      fill: '#DDDDDD',
      fillOpacity: 0.2,
    };

    return <rect x={x} y={y} width={width} height={height} style={style} />;
  }

  render() {
    const { width, height } = this.props;

    return (
      <Group>
        <rect
          width={width}
          height={height}
          fillOpacity={0}
          onMouseDown={interactions.handleMaskMouseDown}
        />
        {interactions.isMaskDragging && this.renderDragRect()}
      </Group>
    );
  }
}
