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
import { observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import { MusicNote } from '@material-ui/icons';

import { engine, sequences, layout, Note } from '../core';

import { Sequence } from './sequence';
import { MAX_PITCH, MIN_PITCH, TOTAL_SIXTEENTHS, RefineOnOriginal } from '../core/constants';

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

const refineSliderMarks = [0, 1, 2, 3, 4].map(value => {
  return {
    value: value,
    label: refineSliderTextOptions(value)
  };
});

function refineSliderTextOptions(value: number) {
  if (value === RefineOnOriginal.VerySimilarNotes) {
    return "Very Similar";
  }
  else if (value === RefineOnOriginal.SimilarNotes) {
    return "Similar";
  }
  else if (value === RefineOnOriginal.NoRefinement) {
    return "No Refinement";
  }
  else if (value === RefineOnOriginal.DifferentNotes) {
    return "Different";
  }
  else if (value === RefineOnOriginal.VeryDifferentNotes) {
    return "Very Different";
  }
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

    const refineOnOriginalStyle = style({
      height: 100,
    });


    const showCandidateSequences = sequences.candidateSequences.length > 0;

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
        <Typography id="temperature-slider" gutterBottom>
          Temperature
        </Typography>
        <div>
          <Slider
            value={sequences.temperature}
            onChange={(e: any, newValue: number | number[]) => {
              if (newValue !== null) {
                sequences.temperature = Number(newValue);
              }
            }}
            // valueLabelFormat={refineSliderTextOptions}
            // getAriaValueText={refineSliderTextOptions}
            aria-labelledby="temperature-slider-restrict"
            step={0.01}
            valueLabelDisplay="auto"
            // marks={refineSliderMarks}
            min={0.01}
            max={0.99}
          />
        </div>
        <Typography id="refine-on-original-slider" gutterBottom>
          Refine On Original
        </Typography>
        <div className={refineOnOriginalStyle}>
          <Slider
            orientation="vertical"
            value={sequences.refineOnOriginalStrategy}
            onChange={(e: any, newValue: number | number[]) => {
              if (newValue!== null) {
                sequences.refineOnOriginalStrategy = Number(newValue);
              }
            }}
            valueLabelFormat={refineSliderTextOptions}
            getAriaValueText={refineSliderTextOptions}
            aria-labelledby="refine-on-original-slider-restrict"
            step={1}
            valueLabelDisplay="auto"
            marks={refineSliderMarks}
            min={0}
            max={4}
          />
        </div>
        {showCandidateSequences && this.renderSequences()}
      </div>
    );
  }
}
