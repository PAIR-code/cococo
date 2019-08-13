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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';

import { KEY_NAMES, MODE_NAMES } from '../core/constants';
import { editor, generator } from '../core';

import { Spacer } from './spacer';

export interface Props {
  isDialogOpen: boolean;
  onRequestClose: () => void;
}

@observer
export class KeySignatures extends React.Component<Props, {}> {
  render() {
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={this.props.isDialogOpen}
        onClose={() => this.props.onRequestClose()}
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
            <Spacer width={30} />
            <FormControl>
              <Select
                value={editor.mode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  if (value) {
                    editor.mode = value;
                    generator.happySad = value === 'major' ? 1 : -1;
                  }
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
              label="Restrict note editing to key"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRequestClose()} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
