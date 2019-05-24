import React from 'react';
import { observer } from 'mobx-react';

import { Note as NoteModel } from '../core/note';
import { editor } from '../core';
import { COLOR_PRIMARY } from '../core/constants';

function getFillColor(note: NoteModel) {
  const isSelected = editor.isNoteSelected(note);
  const isPlaying = note.isPlaying;
  const isUser = note.source === 'USER';

  if (isPlaying) {
    return '#F00';
  } else if (isUser) {
    return isSelected ? '#F00' : COLOR_PRIMARY;
  } else {
    return 'gray';
  }
}

export interface NoteProps {
  note: NoteModel;
  height: number;
  width: number;
  x: number;
  y: number;
}

const NOTE_BORDER = 1;

@observer
export class Note extends React.Component<NoteProps> {
  render() {
    const { note, width, height, x, y } = this.props;

    const fill = getFillColor(note);

    return (
      <rect
        key={`${note.name}:${note.position}:${note.duration}`}
        x={x + 1}
        y={y + NOTE_BORDER}
        width={width - 2 * NOTE_BORDER}
        height={height - 2 * NOTE_BORDER}
        strokeWidth={1}
        stroke="#ddd"
        fill={fill}
        onClick={() => {
          editor.handleNoteClick(note);
        }}
      />
    );
  }
}
