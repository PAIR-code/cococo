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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {
  PlayArrow,
  Stop,
  Delete,
  Edit,
  SelectAll,
  Undo,
  Redo,
} from '@material-ui/icons';
import { observer } from 'mobx-react';

import { engine, layout, editor, EditorTool, undo } from '../core';
import * as theme from '../core/theme';
import { Voice } from '../core/note';
import { KEY_NAMES, MODE_NAMES } from '../core/constants';

interface State {
  keyDialogOpen: boolean;
}

@observer
export class Controls extends React.Component<{}, State> {
  state = {
    keyDialogOpen: false,
  };

  render() {
    const PADDING = 0;
    const width = layout.editorWidth;

    const controlsStyle = style({
      width: width - 2 * PADDING,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: PADDING,
      paddingRight: PADDING,
      marginTop: 10,
    });

    const playDisabled = !engine.isPlayerLoaded;
    const showPlay = !engine.isPlaying;

    const harmonizeEnabled = engine.isModelLoaded && !engine.isWorking;
    const canClear = editor.allNotes.length > 0;

    return (
      <div className={controlsStyle}>
        <div>
          <Button
            disabled={playDisabled}
            variant="outlined"
            color="primary"
            onClick={() => engine.togglePlay()}
          >
            {showPlay ? <PlayArrow /> : <Stop />}
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
              editor.selectedTool = value;
            }
          }}
        >
          <ToggleButton value={EditorTool.DRAW}>
            <Edit />
          </ToggleButton>
          <ToggleButton value={EditorTool.MASK}>
            <SelectAll />
          </ToggleButton>
          <ToggleButton value={EditorTool.ERASE}>
            <Delete />
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
                  editor.selectedVoice = Number(value);
                  // If user changes voices, user very likely wants to start editing
                  editor.selectedTool = EditorTool.DRAW;
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
                  editor.quantizeStep = Number(value);
                  // If user changes step size
                  // and they are in erase mode, user very likely wants to start editing
                  if (editor.selectedTool === EditorTool.ERASE) {
                    editor.selectedTool = EditorTool.DRAW;
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
          <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open={this.state.keyDialogOpen}
            onClose={() => this.setState({ keyDialogOpen: false })}
          >
            <DialogTitle>Edit Key</DialogTitle>
            <DialogContent>
              <form>
                <FormControl>
                  <Select
                    value={editor.key}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      if (value) editor.key = value;
                    }}
                    autoWidth
                  >
                    {KEY_NAMES.map(key => {
                      return (
                        <MenuItem key={key} value={key}>
                          {key}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <FormHelperText style={{ width: 60 }}>Key</FormHelperText>
                </FormControl>
                <Spacer width={10} />
                <FormControl>
                  <Select
                    value={editor.mode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      if (value) editor.mode = value;
                    }}
                    autoWidth
                  >
                    {MODE_NAMES.map(mode => {
                      return (
                        <MenuItem key={mode} value={mode}>
                          {mode}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <FormHelperText style={{ width: 100 }}>Mode</FormHelperText>
                </FormControl>
              </form>
              <div>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editor.constrainToKey}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        (editor.constrainToKey = e.target.checked)
                      }
                      value={editor.constrainToKey}
                      color="primary"
                    />
                  }
                  label="Constrain notes to key"
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.setState({ keyDialogOpen: false })}
                color="primary"
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    );
  }
}

interface SpacerProps {
  width: number;
}
function Spacer(props: SpacerProps) {
  const spacerStyle = style({
    width: props.width,
    display: 'inline-block',
  });
  return <div className={spacerStyle} />;
}
Spacer.defaultProps = { width: 5 };
