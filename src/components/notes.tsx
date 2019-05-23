import React from 'react';
import { Group, Rect } from 'react-konva';
import { observer } from 'mobx-react';

import { editor } from '../core';
import { Note } from '../core/note';
import { COLOR_PRIMARY } from '../core/constants';

export interface Props {
  width: number;
  height: number;
  noteHeight: number;
}

function getFillColor(isSelected: boolean, isUser: boolean) {
  if (isUser) {
    return isSelected ? '#F00' : COLOR_PRIMARY;
  } else {
    return 'gray';
  }
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
    const isUser = note.source === 'USER';
    const fill = getFillColor(isSelected, isUser);

    return (
      <Rect
        key={`${note.name}:${note.position}:${note.duration}`}
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
        {editor.harmonies.map(note => {
          return this.renderNote(note);
        })}
        {[...editor.userNotes.values()].map(note => {
          return this.renderNote(note);
        })}
      </Group>
    );
  }
}
