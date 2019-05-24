import React from 'react';
import { observer } from 'mobx-react';
import { range } from 'lodash';

import { editor } from '../core';
import { ScaleValue } from '../core/editor';

import { Group } from './group';

export interface Props {
  width: number;
  noteHeight: number;
}

@observer
export class Grid extends React.Component<Props> {
  renderLine(item: ScaleValue, scaleIndex: number) {
    const divisions = range(editor.nDivisions);
    const { width, noteHeight } = this.props;
    const y = noteHeight * scaleIndex;

    return (
      <Group key={scaleIndex} x={0} y={y}>
        {divisions.map(divisionIndex => {
          const x = (this.props.width * divisionIndex) / editor.nDivisions;

          const isAccidental = item.name.includes('b');
          const fillColor = isAccidental ? '#EEE' : '#FFF';

          return (
            <rect
              key={divisionIndex}
              x={x}
              y={0}
              width={width}
              height={noteHeight}
              stroke="#CCC"
              fill={fillColor}
              strokeWidth={1}
              onClick={() => {
                editor.handleGridClick(scaleIndex, divisionIndex);
              }}
            />
          );
        })}
      </Group>
    );
  }

  render() {
    return (
      <Group>
        {editor.scale.map((item: ScaleValue, index: number) => {
          return this.renderLine(item, index);
        })}
      </Group>
    );
  }
}
