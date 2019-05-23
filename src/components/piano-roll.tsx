import React from 'react';
import { Group, Rect } from 'react-konva';
import { observer } from 'mobx-react';

import { editor, engine } from '../core';
import { ScaleValue } from '../core/editor';
import { Note } from '../core/note';

export interface Props {
  width: number;
  height: number;
  noteHeight: number;
}

@observer
export class PianoRoll extends React.Component<Props> {
  renderKey(scaleNote: ScaleValue, index: number) {
    const { width, noteHeight } = this.props;
    const y = noteHeight * index;

    const isActive = editor.activeNoteValue === scaleNote.value;
    const isWhite = scaleNote.name.length === 2;
    let fill = isWhite ? 'white' : 'black';

    fill = isActive ? 'red' : fill;

    return (
      <Rect
        key={index}
        x={0}
        y={y}
        width={width}
        height={noteHeight}
        fill={fill}
        stroke={'black'}
        strokeWidth={1}
        onMouseDown={() => {
          const note = new Note(scaleNote.value, 0, 0.2);
          engine.playNoteDown(note);

          const mouseup = () => {
            engine.playNoteUp(note);
          };
          document.addEventListener('mouseup', mouseup);
        }}
      />
    );
  }

  render() {
    const { width, height } = this.props;

    return (
      <Group
        width={width}
        height={height}
        onMouseEnter={() => {
          document.body.style.cursor = 'pointer';
        }}
        onMouseLeave={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {editor.scale.map((scaleNote: ScaleValue, index: number) => {
          return this.renderKey(scaleNote, index);
        })}
      </Group>
    );
  }
}
