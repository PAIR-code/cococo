import React from 'react';
import { observer } from 'mobx-react';
import { style } from 'typestyle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { Controls } from './controls';
import { Editor } from './editor';
import { Working } from './working';

import { engine, layout } from '../core';

@observer
export default class App extends React.Component {
  stageRef: HTMLDivElement;

  componentDidMount() {
    // Set up app resize observation here...
    // const { width } = this.stageRef.getBoundingClientRect();
    // layout.stageWidth = width;
  }

  render() {
    const width = layout.stageWidth;
    const height = 600;

    const stageContainerStyle = style({
      marginTop: 20,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    });

    return (
      <>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              🎹 Bach CoCoCo
            </Typography>
          </Toolbar>
        </AppBar>
        <div className={stageContainerStyle} ref={ref => (this.stageRef = ref)}>
          <Editor width={width} height={height} />
          <Controls />
        </div>
        <Working open={engine.isWorking} title="Working..." />
      </>
    );
  }
}
