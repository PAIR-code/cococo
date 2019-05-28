import React from 'react';
import { observer } from 'mobx-react';
import { editor } from '../core';

import { PianoRoll } from './piano-roll';
import { Grid } from './grid';
import { Group } from './group';
import { Notes } from './notes';
import { Timeline } from './timeline';

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

    const { scale } = editor;
    const notesHeight = scale.length * NOTE_HEIGHT;
    const notesWidth = width - PIANO_ROLL_WIDTH;
    const timelineHeight = 20;

    return (
      <svg width={width} height={height}>
        <Group x={PIANO_ROLL_WIDTH}>
          <Timeline width={notesWidth} height={timelineHeight} />
        </Group>
        <Group y={timelineHeight}>
          <PianoRoll
            width={PIANO_ROLL_WIDTH}
            height={notesHeight}
            noteHeight={NOTE_HEIGHT}
          />
          <Group x={PIANO_ROLL_WIDTH}>
            <Grid width={notesWidth} noteHeight={NOTE_HEIGHT} />
            <Notes width={notesWidth} noteHeight={NOTE_HEIGHT} />
          </Group>
        </Group>
      </svg>
    );
  }
}
