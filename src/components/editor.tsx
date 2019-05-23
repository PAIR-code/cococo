import React from 'react';
import { Stage, Layer, Group } from 'react-konva';
import { observer } from 'mobx-react';
import { editorStore } from '../core';

import { PianoRoll } from './piano-roll';
import { Grid } from './grid';
import { Notes } from './notes';

export interface Props {
  width: number;
  height: number;
}

const PIANO_ROLL_WIDTH = 24;
const NOTE_HEIGHT = 12;

@observer
export class Editor extends React.Component<Props> {
  render() {
    const { width, height } = this.props;
    const color = 'rgba(255,0,0,0.1)';

    const { scale } = editorStore;
    const notesHeight = scale.length * NOTE_HEIGHT;
    const notesWidth = width - PIANO_ROLL_WIDTH;

    return (
      <Stage width={width} height={height} fill={color}>
        <Layer>
          <PianoRoll
            width={PIANO_ROLL_WIDTH}
            height={notesHeight}
            noteHeight={NOTE_HEIGHT}
          />
          <Group x={PIANO_ROLL_WIDTH}>
            <Grid
              width={notesWidth}
              height={notesHeight}
              noteHeight={NOTE_HEIGHT}
            />
            <Notes
              width={notesWidth}
              height={notesHeight}
              noteHeight={NOTE_HEIGHT}
            />
          </Group>
        </Layer>
      </Stage>
    );
  }
}
