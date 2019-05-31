import React from 'react';
import { observer } from 'mobx-react';

import { Note as NoteModel } from '../core/note';
import { editor } from '../core';

import { Group } from './group';
import { Note } from './note';

export interface NotesProps {
  width: number;
  noteHeight: number;
}

@observer
export class Notes extends React.Component<NotesProps> {
  getNoteProps(note: NoteModel) {
    const { noteHeight, width } = this.props;
    const sixteenthWidth = width / editor.totalSixteenths;
    const indexFromMax = editor.scaleMax - note.pitch;

    const y = noteHeight * indexFromMax;
    const x = note.position * sixteenthWidth;
    const noteWidth = note.duration * sixteenthWidth;

    return { x, y, height: noteHeight, width: noteWidth };
  }

  render() {
    return (
      <Group>
        {editor.agentNotes.map(note => (
          <Note key={note.id} note={note} {...this.getNoteProps(note)} />
        ))}
        {editor.userNotes.map(note => (
          <Note key={note.id} note={note} {...this.getNoteProps(note)} />
        ))}
      </Group>
    );
  }
}
