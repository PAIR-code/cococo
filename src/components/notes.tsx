import React from 'react';
import { Group, Rect } from 'react-konva';
import { observer } from 'mobx-react';

import { editor } from '../core';
import { Note } from '../core/note';

export interface Props {
  width: number;
  height: number;
  noteHeight: number;
}

@observer
export class Notes extends React.Component<Props> {
  renderNote(note: Note) {
    const { width, noteHeight } = this.props;

    const indexFromMax = editor.scaleMax - note.value;
    const sixteenthWidth = width / editor.totalSixteenths;

    const y = noteHeight * indexFromMax;
    const x = note.position * sixteenthWidth;
    const noteWidth = note.duration * sixteenthWidth;

    const isSelected = editor.isNoteSelected(note);
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
          editor.handleNoteClick(note);
        }}
      />
    );
  }

  render() {
    const { width, height } = this.props;

    return (
      <Group width={width} height={height}>
        {editor.notesArray.map(note => {
          return this.renderNote(note);
        })}
      </Group>
    );
  }
}
