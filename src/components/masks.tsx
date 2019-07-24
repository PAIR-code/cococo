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
    const { maskToolDragStartXY, maskToolDragXY } = interactions;
    const maskToolDragWidth = maskToolDragXY[0] - maskToolDragStartXY[0];
    const maskToolDragHeight = maskToolDragXY[1] - maskToolDragStartXY[1];

    const x =
      maskToolDragWidth >= 0 ? maskToolDragStartXY[0] : maskToolDragXY[0];
    const y =
      maskToolDragHeight >= 0 ? maskToolDragStartXY[1] : maskToolDragXY[1];
    const width = Math.abs(maskToolDragWidth);
    const height = Math.abs(maskToolDragHeight);

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
          onMouseDown={interactions.handleMaskToolMouseDown}
        />
        {interactions.isMaskToolDragging && this.renderDragRect()}
      </Group>
    );
  }
}
