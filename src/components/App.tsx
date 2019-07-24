import React from 'react';
import { observer } from 'mobx-react';
import { style } from 'typestyle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider } from '@material-ui/styles';

import { Controls } from './controls';
import { Editor } from './editor';
import { Sequences } from './sequences';
import { Working } from './working';

import { engine, layout } from '../core';
import { theme } from '../core/theme';

@observer
export default class App extends React.Component {
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
            <Sequences />
          </div>
        </div>
        <Working open={engine.isWorking} title="Working..." />
      </ThemeProvider>
    );
  }
}
