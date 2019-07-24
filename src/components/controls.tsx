import React from 'react';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
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
import { observer } from 'mobx-react';

import { engine, layout, editor, EditorTool, undo } from '../core';
import * as theme from '../core/theme';
import { Voice } from '../core/note';

@observer
export class Controls extends React.Component<{}> {
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
          <Spacer />
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
        <div>
          <FormControl>
            <Select
              style={{ color: theme.VOICE_COLORS[editor.selectedVoice] }}
              value={editor.selectedVoice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (value !== null) {
                  editor.selectedVoice = Number(value);
                }
              }}
              autoWidth
            >
              <MenuItem
                style={{ color: theme.COLOR_SOPRANO }}
                value={Voice.SOPRANO}
              >
                Soprano
              </MenuItem>
              <MenuItem style={{ color: theme.COLOR_ALTO }} value={Voice.ALTO}>
                Alto
              </MenuItem>
              <MenuItem
                style={{ color: theme.COLOR_TENOR }}
                value={Voice.TENOR}
              >
                Tenor
              </MenuItem>
              <MenuItem style={{ color: theme.COLOR_BASS }} value={Voice.BASS}>
                Bass
              </MenuItem>
            </Select>
            <FormHelperText style={{ width: 100 }}>Voice</FormHelperText>
          </FormControl>
          <Spacer width={10} />
          <FormControl>
            <Select
              value={editor.quantizeStep}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (value !== null) {
                  editor.quantizeStep = Number(value);
                }
              }}
              autoWidth
            >
              <MenuItem value={1}>1/16</MenuItem>
              <MenuItem value={2}>1/8</MenuItem>
              <MenuItem value={4}>1/4</MenuItem>
              <MenuItem value={8}>1/2</MenuItem>
            </Select>
            <FormHelperText style={{ width: 100 }}>Quantization</FormHelperText>
          </FormControl>
        </div>
        <div>
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

interface SpacerProps {
  width: number;
}
function Spacer(props: SpacerProps) {
  const spacerStyle = style({
    width: props.width,
    display: 'inline-block',
  });
  return <div className={spacerStyle} />;
}
Spacer.defaultProps = { width: 5 };
