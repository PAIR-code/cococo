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
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {
  PlayArrow,
  Stop,
  DeleteSweep,
  Edit,
  SelectAll,
  Undo,
  Redo,
  CloudDownload,
} from '@material-ui/icons';
import { observer } from 'mobx-react';

import { generator, player, layout, editor, EditorTool, undo } from '../core';
import saveload from '../core/save-load';
import * as theme from '../core/theme';
import { Voice } from '../core/note';

import { KeySignatures } from './key-signatures';
import { Spacer } from './spacer';
import featureFlags from '../core/feature-flags';

interface State {
  keyDialogOpen: boolean;
}

@observer
export class Controls extends React.Component<{}, State> {
  state = {
    keyDialogOpen: false,
  };

  render() {
    const { baseline } = featureFlags;
    const PADDING = 0;
    const width = layout.editorWidth;

    const controlsStyle = style({
      width: width - 2 * PADDING,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: PADDING,
      paddingRight: PADDING,
      margin: '20px 0 60px',
      height: layout.controlsHeight,
    });

    const playDisabled = !player.isPlayerLoaded || editor.allNotes.length === 0;
    const showPlay = !player.isPlaying;
    const maskButtonDisabled = generator.candidateSequences.length > 1;

    return (
      <div className={controlsStyle}>
        <div>
          <Button
            disabled={playDisabled}
            variant="outlined"
            color="primary"
            onClick={() => player.togglePlay()}
          >
            {showPlay ? <PlayArrow /> : <Stop />}
          </Button>
        </div>
        <div>
          <Button
            disabled={playDisabled}
            variant="outlined"
            color="primary"
            onClick={() => saveload.saveMIDI()}
          >
            <CloudDownload/>
          </Button>
        </div>
        <div>
          <Button
            disabled={!undo.canUndo}
            variant="outlined"
            color="primary"
            onClick={() => undo.undo()}
          >
            {<Undo />}
          </Button>
          <Spacer />
          <Button
            disabled={!undo.canRedo}
            variant="outlined"
            color="primary"
            onClick={() => undo.redo()}
          >
            {<Redo />}
          </Button>
        </div>
        <ToggleButtonGroup
          value={editor.selectedTool}
          exclusive
          onChange={(e, value: EditorTool) => {
            if (value !== null) {
              editor.selectTool(value);
            }
          }}
        >
          <ToggleButton value={EditorTool.DRAW}>
            <Edit />
          </ToggleButton>
          {baseline ? null : (
            <ToggleButton value={EditorTool.MASK} disabled={maskButtonDisabled}>
              <SelectAll />
            </ToggleButton>)}
          <ToggleButton value={EditorTool.ERASE}>
            <DeleteSweep />
          </ToggleButton>
        </ToggleButtonGroup>
        <div>
          <FormControl>
            <Select
              style={{ color: theme.VOICE_COLORS[editor.selectedVoice] }}
              value={editor.selectedVoice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (value !== null) {
                  editor.selectVoice(Number(value));
                  // If user changes voices, user very likely wants to start editing
                  editor.selectTool(EditorTool.DRAW, false /** logging */);
                }
              }}
              autoWidth
            >
              <MenuItem
                style={{ color: theme.COLOR_SOPRANO }}
                value={Voice.SOPRANO}
              >
                Soprano
              </MenuItem>
              <MenuItem style={{ color: theme.COLOR_ALTO }} value={Voice.ALTO}>
                Alto
              </MenuItem>
              <MenuItem
                style={{ color: theme.COLOR_TENOR }}
                value={Voice.TENOR}
              >
                Tenor
              </MenuItem>
              <MenuItem style={{ color: theme.COLOR_BASS }} value={Voice.BASS}>
                Bass
              </MenuItem>
            </Select>
            <FormHelperText style={{ width: 100 }}>Voice</FormHelperText>
          </FormControl>
          <Spacer width={10} />
          <FormControl>
            <Select
              value={editor.quantizeStep}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (value !== null) {
                  editor.selectQuantization(Number(value));
                  // If user changes step size
                  // and they are in erase mode, user very likely wants to start editing
                  if (editor.selectedTool === EditorTool.ERASE) {
                    editor.selectTool(EditorTool.DRAW, false /** logging */);
                  }
                  // if they are in mask mode, they might want a more refined mask size
                  // in which case don't change it automatically
                }
              }}
              autoWidth
            >
              <MenuItem value={1}>1/16</MenuItem>
              <MenuItem value={2}>1/8</MenuItem>
              <MenuItem value={4}>1/4</MenuItem>
              <MenuItem value={8}>1/2</MenuItem>
            </Select>
            <FormHelperText style={{ width: 100 }}>Quantization</FormHelperText>
          </FormControl>
        </div>
        <div>
          <Button
            onClick={() => this.setState({ keyDialogOpen: true })}
            variant="outlined"
            color="primary"
          >
            {editor.key} {editor.mode}
          </Button>
        </div>
        <KeySignatures
          isDialogOpen={this.state.keyDialogOpen}
          onRequestClose={() => this.setState({ keyDialogOpen: false })}
        />
      </div>
    );
  }
}
