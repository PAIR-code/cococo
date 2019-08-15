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
import { editor, generator, logging } from '../core';

import { Spacer } from './spacer';

@observer
export class Logging extends React.Component<{}, {}> {
  render() {
    const { closeLoggingDialog, isLoggingDialogOpen } = logging;

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={isLoggingDialogOpen}
        onClose={() => closeLoggingDialog()}
      >
        <DialogTitle>Logging</DialogTitle>
        <DialogContent>
          <h1>Logging placeholder</h1>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeLoggingDialog()} color="primary">
            Cancel
          </Button>
          <Button onClick={() => closeLoggingDialog()} color="primary">
            Download
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
