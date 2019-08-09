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
import _ from 'lodash';
import { style } from 'typestyle';
import { observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import { MusicNote } from '@material-ui/icons';

import { editor, engine, sequences, layout, Note } from '../core';

import { Sequence } from './sequence';
import {
  MIN_SURPRISE_FACTOR,
  MAX_SURPRISE_FACTOR,
  MIN_SIMILARITY_FACTOR,
  MAX_SIMILARITY_FACTOR,
  MAX_PITCH,
  MIN_PITCH,
  TOTAL_SIXTEENTHS,
  SimilarityToOriginal,
} from '../core/constants';

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

const horizontalSliderStyle = style({});

const happySadMarks = [
  {
    value: -1,
    label: '😢🙁sad',
  },
  {
    value: 0,
  },
  {
    value: 1,
    label: '😃😊happy',
  },
];

export interface GenerateProps {}

@observer
export class Generate extends React.Component<GenerateProps> {
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

  renderSimilaritySlider() {
    const disabled = editor.getMaskedSequence.length === 0;
    const labelColor = disabled ? 'textSecondary' : 'textPrimary';
    return (
      <div>
        <Typography color={labelColor}>
          {getSimilarityMessage(sequences.similarityToOriginal)}
        </Typography>
        <div className={horizontalSliderStyle}>
          <Slider
            value={sequences.similarityToOriginal}
            onChange={(e: any, newValue: number | number[]) => {
              if (newValue !== null) {
                sequences.similarityToOriginal = Number(newValue);
              }
            }}
            step={0.1}
            valueLabelDisplay="off"
            min={MIN_SIMILARITY_FACTOR}
            max={MAX_SIMILARITY_FACTOR}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  render() {
    const harmonizeEnabled = engine.isModelLoaded && !engine.isWorking;

    const containerStyle = style({
      padding: '0 10px',
      display: 'flex',
      flexDirection: 'column',
    });

    const dividerStyle = style({
      margin: '20px 0 10px',
    });

    const nSequencesContainerStyle = style({
      marginTop: 10,
      width: '100%',
    });

    const showCandidateSequences = sequences.candidateSequences.length > 0;

    return (
      <div className={containerStyle}>
        <Button
          disabled={!harmonizeEnabled}
          variant="outlined"
          color="primary"
          onClick={() => {
            if (sequences.candidateSequences.length) {
              sequences.commitSelectedCandidateSequence();
            }
            engine.harmonize();
          }}
        >
          🤖 Generate
          <MusicNote />
        </Button>

        <FormControl className={nSequencesContainerStyle}>
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
            <MenuItem value={1}>1 sequence</MenuItem>
            <MenuItem value={2}>2 sequences</MenuItem>
            <MenuItem value={3}>3 sequences</MenuItem>
            <MenuItem value={4}>4 sequences</MenuItem>
          </Select>
        </FormControl>
        <Divider classes={{ root: dividerStyle }} />
        <div className={horizontalSliderStyle}>
          <Typography>
            {getSurpriseMessage(sequences.conventionalSurprising)}
          </Typography>
          <Slider
            value={sequences.conventionalSurprising}
            onChange={(e: any, newValue: number | number[]) => {
              if (newValue !== null) {
                sequences.conventionalSurprising = Number(newValue);
              }
            }}
            aria-labelledby="temperature-slider-restrict"
            step={0.1}
            min={MIN_SURPRISE_FACTOR}
            max={MAX_SURPRISE_FACTOR}
          />
        </div>
        <div className={horizontalSliderStyle}>
          <Slider
            value={sequences.happySad}
            onChange={(e: any, newValue: number | number[]) => {
              if (newValue !== null) {
                sequences.happySad = Number(newValue);
                if (sequences.happySad === 1) {
                  editor.mode = 'major';
                } else if (sequences.happySad === -1) {
                  editor.mode = 'minor';
                }
              }
            }}
            aria-labelledby="happysad-slider-restrict"
            step={null}
            valueLabelDisplay="off"
            marks={happySadMarks}
            min={-1.2}
            max={1.2}
          />
        </div>
        {this.renderSimilaritySlider()}
        {showCandidateSequences && this.renderSequences()}
      </div>
    );
  }
}

const similarityMessages = [
  'Very Different',
  'Different',
  'Somewhat Different',
  'Somewhat Similar',
  'Similar',
  'Very Similar',
];
const surpriseMessages = [
  'Very Conventional',
  'Conventional',
  'Somewhat Conventional',
  'Somewhat Surprising',
  'Surprising',
  'Very Surprising',
];

const getMessageText = (messages: string[], min: number, max: number) => (
  value: number
): string => {
  // Constructs the ranges non-inclusively
  const range = _.range(min, max, (max - min) / messages.length);
  range.push(max);

  for (let i = 0; i < range.length - 1; i++) {
    if (value >= range[i] && value < range[i + 1]) {
      return messages[i];
    }
  }
  // If the value is equal to the largest number in the range, select the last
  // message
  if (value === range[range.length - 1]) {
    return messages[messages.length - 1];
  }
  return '';
};

const getSurpriseMessage = getMessageText(
  surpriseMessages,
  MIN_SURPRISE_FACTOR,
  MAX_SURPRISE_FACTOR
);
const getSimilarityMessage = getMessageText(
  similarityMessages,
  MIN_SIMILARITY_FACTOR,
  MAX_SIMILARITY_FACTOR
);
