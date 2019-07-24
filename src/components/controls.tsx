import React from 'react';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import {
  MusicNote,
  PlayArrow,
  Stop,
  Delete,
  Edit,
  SelectAll,
  Undo,
  Redo,
} from '@material-ui/icons';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { observer } from 'mobx-react';

import { engine, layout, editor, EditorTool, undo } from '../core';

@observer
export class Controls extends React.Component<{}> {
  renderSpacer(width = 5) {
    const spacerStyle = style({
      width,
      display: 'inline-block',
    });
    return <div className={spacerStyle} />;
  }
  render() {
    const PADDING = 20;
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
          {this.renderSpacer()}
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
        <div>
          <Button
            disabled={!harmonizeEnabled}
            variant="outlined"
            color="primary"
            onClick={() => engine.harmonize()}
          >
            Harmonize
            <MusicNote />
          </Button>
          {this.renderSpacer()}
          <Button
            disabled={!canClear}
            variant="outlined"
            color="primary"
            onClick={() => editor.clearAllNotes()}
          >
            Clear
          </Button>
        </div>
      </div>
    );
  }
}
