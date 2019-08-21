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
import { range } from 'lodash';

import { editor, interactions } from '../core';
import { DIVISIONS } from '../core/constants';
import { ScaleValue } from '../core/editor';
import blue from '@material-ui/core/colors/blue';

import { Group } from './group';

export interface Props {
  width: number;
  noteHeight: number;
}

@observer
export class Grid extends React.Component<Props> {
  renderDivision(divisionIndex: number) {
    const x = (this.props.width / editor.totalSixteenths) * divisionIndex;
    const height = this.props.noteHeight * editor.scale.length;

    const isWhole = divisionIndex % 16 === 0;
    const color = isWhole ? '#494949' : '#555';
    const strokeWidth = isWhole ? 2 : 1;

    return (
      <line
        key={divisionIndex}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    );
  }

  renderNoteGrid(scaleValue: ScaleValue, scaleIndex: number) {
    const divisions = range(editor.nDivisions);
    const { width, noteHeight } = this.props;
    const y = noteHeight * scaleIndex;
    const gridWidth = width / editor.nDivisions;

    return (
      <Group key={scaleIndex} x={0} y={y}>
        {divisions.map(divisionIndex => {
          const x = (this.props.width / editor.nDivisions) * divisionIndex;

          const isInScale = editor.isPitchInScale(scaleValue.pitch);
          const isRoot = editor.key === scaleValue.name;
          const fillColor = isInScale
            ? isRoot
              ? blue[500]
              : blue[400]
            : 'white';
          const fillOpacity = isRoot ? 0.25 : 0.12;
          const strokeColor = fillColor;

          return (
            <rect
              key={divisionIndex}
              x={x}
              y={0}
              width={gridWidth}
              height={noteHeight}
              stroke={strokeColor}
              opacity={fillOpacity}
              fill={fillColor}
              strokeWidth={1}
              onMouseDown={interactions.handleGridMouseDown(
                scaleIndex,
                divisionIndex
              )}
              onMouseEnter={() => {
                editor.setNoteHoverName(scaleValue);
              }}
            />
          );
        })}
      </Group>
    );
  }

  render() {
    return (
      <g id="editor-grid">
        {editor.scale.map((scaleValue: ScaleValue, index: number) => {
          return this.renderNoteGrid(scaleValue, index);
        })}
        {DIVISIONS.map(division => this.renderDivision(division))}
      </g>
    );
  }
}
