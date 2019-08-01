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

    const isMuted = editor.isVoiceMuted(note.voice);

    return { x, y, height: noteHeight, width: noteWidth, isMuted };
  }

  render() {
    return (
      <Group>
        {editor.allNotes.map(note => (
          <Note key={note.id} note={note} {...this.getNoteProps(note)} />
        ))}
      </Group>
    );
  }
}
