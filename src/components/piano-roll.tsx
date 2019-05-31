import React from 'react';
import { style } from 'typestyle';
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

    const isActive = editor.activeNoteValue === scaleNote.pitch;
    const isWhite = scaleNote.name.length === 2;
    let fill = isWhite ? 'white' : 'black';

    fill = isActive ? 'red' : fill;
    const fadeDuration = isActive ? 0 : 0.5;

    const rectStyle = style({
      transition: `fill ${fadeDuration}s`,
      fill,
      stroke: '#CCC',
      strokeWidth: 1,
    });

    return (
      <rect
        key={index}
        className={rectStyle}
        x={0}
        y={y}
        width={width}
        height={noteHeight}
        onMouseDown={e => {
          e.preventDefault();
          const note = new Note(scaleNote.pitch, 0, 0.2);
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
      <g
        y={0}
        width={width}
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
      </g>
    );
  }
}
