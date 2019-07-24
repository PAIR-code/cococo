import React from 'react';
import { observer } from 'mobx-react';
import { editor, layout, EditorTool } from '../core';

import { PianoRoll } from './piano-roll';
import { Grid } from './grid';
import { Group } from './group';
import { LoopOverlay } from './loop-overlay';
import { MaskLanes } from './mask-lanes';
import { Notes } from './notes';
import { Timeline } from './timeline';
import { Masks } from './masks';

export interface Props {}

@observer
export class Editor extends React.Component<Props> {
  render() {
    const {
      editorWidth: width,
      editorHeight: height,
      maskLanesHeight,
      noteHeight,
      pianoRollWidth,
    } = layout;

    const { scale } = editor;
    const notesHeight = scale.length * noteHeight;
    const notesWidth = width - pianoRollWidth;

    const isMaskToolSelected = editor.selectedTool === EditorTool.MASK;

    return (
      <svg width={width} height={height}>
        <Group x={pianoRollWidth}>
          <Timeline width={notesWidth} height={layout.timelineHeight} />
        </Group>
        <Group y={layout.maskLanesY}>
          <MaskLanes
            width={notesWidth}
            height={maskLanesHeight}
            labelWidth={pianoRollWidth}
          />
        </Group>
        <Group y={layout.notesY}>
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
            <LoopOverlay width={notesWidth} height={notesHeight} />
          </Group>
        </Group>
      </svg>
    );
  }
}
