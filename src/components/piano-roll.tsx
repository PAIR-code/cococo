import React from 'react';
import { Group, Rect } from 'react-konva';
import { editorStore, engine } from '../core';
import { Note, ScaleValue } from '../core/editor';
import { observer } from 'mobx-react';

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

    const isActive = editorStore.activeNoteValue === scaleNote.value;
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
        {editorStore.scale.map((scaleNote: ScaleValue, index: number) => {
          return this.renderKey(scaleNote, index);
        })}
      </Group>
    );
  }
}
