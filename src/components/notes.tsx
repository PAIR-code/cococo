import React from 'react';
import { Group, Rect } from 'react-konva';
import { observer } from 'mobx-react';

import { editorStore } from '../core';
import { Note } from '../core/editor';

export interface Props {
  width: number;
  height: number;
  noteHeight: number;
}

@observer
export class Notes extends React.Component<Props> {
  renderNote(note: Note) {
    const { width, noteHeight } = this.props;

    const indexFromMax = editorStore.scaleMax - note.value;
    const divisonWidth = width / editorStore.nDivisions;

    const y = noteHeight * indexFromMax;
    const x = note.position * divisonWidth;
    const noteWidth = note.duration * divisonWidth;

    const isSelected = editorStore.isNoteSelected(note);
    const fill = isSelected ? 'red' : 'grey';

    return (
      <Rect
        key={`${note.name}:${note.position}`}
        x={x}
        y={y}
        width={noteWidth}
        height={noteHeight}
        stroke="lightGray"
        fill={fill}
        onClick={() => {
          editorStore.handleNoteClick(note);
        }}
      />
    );
  }

  render() {
    const { width, height } = this.props;

    return (
      <Group width={width} height={height}>
        {editorStore.notesArray.map(note => {
          return this.renderNote(note);
        })}
      </Group>
    );
  }
}
