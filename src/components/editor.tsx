import React from 'react';
import { observer } from 'mobx-react';
import { editor, layout, EditorTool } from '../core';

import { PianoRoll } from './piano-roll';
import { Grid } from './grid';
import { Group } from './group';
import { Notes } from './notes';
import { Timeline } from './timeline';
import { Masks } from './masks';

export interface Props {
  width: number;
  height: number;
}

@observer
export class Editor extends React.Component<Props> {
  render() {
    const { width, height } = this.props;
    const { noteHeight, pianoRollWidth } = layout;

    const { scale } = editor;
    const notesHeight = scale.length * noteHeight;
    const notesWidth = width - pianoRollWidth;
    const timelineHeight = 20;

    const isMaskToolSelected = editor.selectedTool === EditorTool.MASK;

    return (
      <svg width={width} height={height}>
        <Group x={pianoRollWidth}>
          <Timeline width={notesWidth} height={timelineHeight} />
        </Group>
        <Group y={timelineHeight}>
          <PianoRoll
            width={pianoRollWidth}
            height={notesHeight}
            noteHeight={noteHeight}
          />
          <Group x={pianoRollWidth}>
            <Grid width={notesWidth} noteHeight={noteHeight} />
            <Notes width={notesWidth} noteHeight={noteHeight} />
            {isMaskToolSelected && (
              <Masks width={notesWidth} height={notesHeight} />
            )}
          </Group>
        </Group>
      </svg>
    );
  }
}
