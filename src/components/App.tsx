import React from 'react';
import { observer } from 'mobx-react';
import { style } from 'typestyle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { Controls } from './controls';
import { Editor } from './editor';

import { layout } from '../core';

@observer
export default class App extends React.Component {
  stageRef: HTMLDivElement;

  componentDidMount() {
    // Set up app resize observation here...
    const { width } = this.stageRef.getBoundingClientRect();
    layout.stageWidth = width;
  }

  render() {
    const width = layout.stageWidth;
    const height = 600;

    const stageStyle = style({
      marginTop: 20,
      width: '100%',
      height: '100%',
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
        <div className={stageStyle} ref={ref => (this.stageRef = ref)}>
          <Editor width={width} height={height} />
          <Controls />
        </div>
      </>
    );
  }
}
