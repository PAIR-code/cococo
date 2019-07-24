import React from 'react';
import { style } from 'typestyle';
import { observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import { MusicNote } from '@material-ui/icons';

import { engine, sequences, layout, Note } from '../core';

import { Sequence } from './sequence';
import { MAX_PITCH, MIN_PITCH, TOTAL_SIXTEENTHS } from '../core/constants';

function getPitchRange(noteSequences: Note[][]) {
  let minPitch = MAX_PITCH;
  let maxPitch = MIN_PITCH;

  noteSequences.forEach(noteSequence => {
    noteSequence.forEach(note => {
      minPitch = Math.min(note.pitch, minPitch);
      maxPitch = Math.max(note.pitch, maxPitch);
    });
  });

  return [minPitch, maxPitch];
}

function getPositionRange(noteSequences: Note[][]) {
  let minPosition = TOTAL_SIXTEENTHS;
  let maxPosition = 0;

  noteSequences.forEach(noteSequence => {
    noteSequence.forEach(note => {
      minPosition = Math.min(note.start, minPosition);
      maxPosition = Math.max(note.end, maxPosition);
    });
  });

  return [minPosition, maxPosition];
}

export interface SequencesProps {}

@observer
export class Sequences extends React.Component<SequencesProps> {
  renderSequences() {
    const noteSequences = sequences.candidateSequences;
    const [minPitch, maxPitch] = getPitchRange(noteSequences);
    const [minPosition, maxPosition] = getPositionRange(noteSequences);

    const sequencesContainerStyle = style({
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
    });

    return (
      <div className={sequencesContainerStyle}>
        {noteSequences.map((notes, index) => {
          return (
            <Sequence
              key={index}
              title={index === 0 ? 'original' : ''}
              notes={notes}
              maxPitch={maxPitch}
              minPitch={minPitch}
              maxPosition={maxPosition}
              minPosition={minPosition}
              isSelected={sequences.selectedCandidateSequenceIndex === index}
              onSelect={() => sequences.selectCandidateSequence(index)}
            />
          );
        })}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => sequences.commitSelectedCandidateSequence()}
        >
          Choose
        </Button>
        <div style={{ height: 10 }} />
        <Button
          variant="outlined"
          color="primary"
          onClick={() => sequences.clearCandidateSequences()}
        >
          Clear
        </Button>
      </div>
    );
  }

  render() {
    const harmonizeEnabled = engine.isModelLoaded && !engine.isWorking;

    const containerStyle = style({
      margin: 10,
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
      width: layout.sequencesWidth,
    });

    return (
      <div className={containerStyle}>
        <Button
          disabled={!harmonizeEnabled}
          variant="outlined"
          color="primary"
          onClick={() => engine.harmonize()}
        >
          Generate
          <MusicNote />
        </Button>
        <FormControl>
          <Select
            value={sequences.nSequencesToGenerate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              if (value !== null) {
                sequences.nSequencesToGenerate = Number(value);
              }
            }}
            autoWidth
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
          </Select>
          <FormHelperText style={{ width: 100 }}>n sequences</FormHelperText>
        </FormControl>
        {sequences.candidateSequences && this.renderSequences()}
      </div>
    );
  }
}
