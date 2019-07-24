import React from 'react';
import { observer } from 'mobx-react';
import { range } from 'lodash';

import { editor, interactions } from '../core';
import { DIVISIONS } from '../core/constants';
import { ScaleValue } from '../core/editor';

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

  renderNoteGrid(item: ScaleValue, scaleIndex: number) {
    const divisions = range(editor.nDivisions);
    const { width, noteHeight } = this.props;
    const y = noteHeight * scaleIndex;
    const gridWidth = width / editor.nDivisions;

    return (
      <Group key={scaleIndex} x={0} y={y}>
        {divisions.map(divisionIndex => {
          const x = (this.props.width / editor.nDivisions) * divisionIndex;

          const isAccidental = item.name.includes('b');
          const fillColor = isAccidental ? '#EEE' : '#FFF';

          return (
            <rect
              key={divisionIndex}
              x={x}
              y={0}
              width={gridWidth}
              height={noteHeight}
              stroke="#CCC"
              fill={fillColor}
              strokeWidth={1}
              onMouseDown={interactions.handleGridMouseDown(
                scaleIndex,
                divisionIndex
              )}
            />
          );
        })}
      </Group>
    );
  }

  render() {
    return (
      <Group>
        {editor.scale.map((scaleValue: ScaleValue, index: number) => {
          return this.renderNoteGrid(scaleValue, index);
        })}
        {DIVISIONS.map(division => this.renderDivision(division))}
      </Group>
    );
  }
}
