import React from 'react';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import { observer } from 'mobx-react';

import { engine, layout } from '../core';

@observer
export class Controls extends React.Component<{}> {
  render() {
    const PADDING = 40;
    const width = layout.stageWidth;

    const controlsStyle = style({
      width: width - 2 * PADDING,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: PADDING,
      paddingRight: PADDING,
    });

    const playDisabled = !engine.isPlayerLoaded;
    const showPlay = !engine.isPlaying;

    const harmonizeEnabled = engine.isModelLoaded && !engine.isWorking;

    return (
      <div className={controlsStyle}>
        <Button
          disabled={playDisabled}
          variant="contained"
          color="primary"
          onClick={() => engine.togglePlay()}
        >
          {showPlay ? <PlayArrowIcon /> : <StopIcon />}
        </Button>
        <Button
          disabled={!harmonizeEnabled}
          variant="contained"
          color="primary"
          onClick={() => engine.harmonize()}
        >
          Harmonize
          <MusicNoteIcon />
        </Button>
      </div>
    );
  }
}
