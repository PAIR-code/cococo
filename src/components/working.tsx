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

import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';

export interface WorkingProps {
  open: boolean;
  title: string;
}

export function Working(props: WorkingProps) {
  const { open, title } = props;

  const spinnerStyle = style({
    width: 200,
    height: 160,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
  });

  return (
    <Dialog open={open}>
      <div className={spinnerStyle}>
        <Typography variant="h6" color="inherit">
          🤖 Working...
        </Typography>{' '}
        <CircularProgress color="secondary" />
      </div>
    </Dialog>
  );
}
