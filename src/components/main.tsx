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
import { style } from 'typestyle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider } from '@material-ui/styles';

import { Controls } from './controls';
import { Editor } from './editor';
import { Generate } from './generate';
import { Working } from './working';

import { engine, layout } from '../core';
import { theme } from '../core/theme';

@observer
export default class Main extends React.Component {
  stageRef: HTMLDivElement;

  render() {
    const stageContainerStyle = style({
      marginTop: 20,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    });
    const editorContainerStyle = style({
      width: layout.editorWidth,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    });
    const sequencesContainerStyle = style({
      width: layout.sequencesWidth,
      height: '100%',
    });

    return (
      <ThemeProvider theme={theme}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              𝄡 Bach CoCoCo
            </Typography>
          </Toolbar>
        </AppBar>
        <div className={stageContainerStyle} ref={ref => (this.stageRef = ref)}>
          <div className={editorContainerStyle}>
            <Editor />
            <Controls />
          </div>
          <div className={sequencesContainerStyle}>
            <Generate />
          </div>
        </div>
        <Working open={engine.isWorking} title="Working..." />
      </ThemeProvider>
    );
  }
}
