import React from 'react';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { observer } from 'mobx-react';

import { engine, layout, editor } from '../core';

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
        <ToggleButtonGroup
          value={editor.quantizeStep}
          exclusive
          onChange={(e, value) => {
            if (value !== null) {
              editor.quantizeStep = value;
            }
          }}
        >
          <ToggleButton value={1}>1/16</ToggleButton>
          <ToggleButton value={2}>1/8</ToggleButton>
          <ToggleButton value={4}>1/4</ToggleButton>
          <ToggleButton value={8}>1/2</ToggleButton>
        </ToggleButtonGroup>
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
