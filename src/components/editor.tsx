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
import { editor, layout, EditorTool } from '../core';

import { PianoRoll } from './piano-roll';
import { Filters } from './filters';
import { Grid } from './grid';
import { Group } from './group';
import { LoopOverlay } from './loop-overlay';
import { MaskLanes } from './mask-lanes';
import { Notes } from './notes';
import { Timeline } from './timeline';
import { MasksSelect } from './masks-select';
import featureFlags from '../core/feature-flags';

export interface Props {}

@observer
export class Editor extends React.Component<Props> {
  render() {
    const {
      noteHeight,
      pianoRollWidth,
      maskLanesHeight,
      editorWidth,
      editorHeight,
      notesWidth,
      notesHeight,
      timelineHeight,
    } = layout;

    const isMaskToolSelected = editor.selectedTool === EditorTool.MASK;

    return (
      <svg width={editorWidth} height={editorHeight}>
        <Filters />
        <Group x={pianoRollWidth}>
          <Timeline width={notesWidth} height={timelineHeight} />
        </Group>
        {featureFlags.baseline ? null : (
          <Group y={layout.maskLanesY}>
            <MaskLanes
              width={notesWidth}
              height={maskLanesHeight}
              labelWidth={pianoRollWidth}
            />
          </Group>
        )}
        <Group
          y={layout.notesY}
          onMouseLeave={() => editor.setNoteHoverName(null)}
        >
          <PianoRoll
            width={pianoRollWidth}
            height={notesHeight}
            noteHeight={noteHeight}
          />
          <Group x={pianoRollWidth}>
            <Grid width={notesWidth} noteHeight={noteHeight} />
            <Notes width={notesWidth} noteHeight={noteHeight} />
          </Group>
        </Group>
        <Group y={layout.notesY} x={pianoRollWidth}>
          {isMaskToolSelected && (
            <MasksSelect width={notesWidth} height={notesHeight} />
          )}
          <LoopOverlay width={notesWidth} height={notesHeight} />
        </Group>
      </svg>
    );
  }
}
