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

import { interactions, editor } from '../core';

import { Group } from './group';

export interface NotesProps {
  height: number;
  width: number;
}

@observer
export class MasksSelect extends React.Component<NotesProps> {
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

    const maskOverlayStyle = style({
      cursor: 'crosshair',
    });

    return (
      <Group>
        <rect
          width={width}
          height={height}
          fillOpacity={0}
          onMouseDown={interactions.handleMaskToolMouseDown}
          className={maskOverlayStyle}
        />
        {interactions.isMaskToolDragging && this.renderDragRect()}
      </Group>
    );
  }
}
