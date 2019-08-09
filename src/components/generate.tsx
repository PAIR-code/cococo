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
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { MusicNote } from '@material-ui/icons';

import { editor, generator } from '../core';
import { NoteSequence } from '../core/note-sequence';

import { Sequence } from './sequence';
import {
  MIN_HAPPY_SAD_FACTOR,
  MAX_HAPPY_SAD_FACTOR,
  MIN_SURPRISE_FACTOR,
  MAX_SURPRISE_FACTOR,
  MIN_DIFFERENCE_FACTOR,
  MAX_DIFFERENCE_FACTOR,
  MIN_PITCH,
  MAX_PITCH,
  HAPPY_SAD_MARKS,
  TOTAL_SIXTEENTHS,
} from '../core/constants';

import './generate.css';

function getPitchRange(noteSequences: NoteSequence[]) {
  let minPitch = MAX_PITCH;
  let maxPitch = MIN_PITCH;

  noteSequences.forEach(noteSequence => {
    noteSequence.notes.forEach(note => {
      minPitch = Math.min(note.pitch, minPitch);
      maxPitch = Math.max(note.pitch, maxPitch);
    });
  });

  return [minPitch, maxPitch];
}

function getPositionRange(noteSequences: NoteSequence[]) {
  let minPosition = TOTAL_SIXTEENTHS;
  let maxPosition = 0;

  noteSequences.forEach(noteSequence => {
    noteSequence.notes.forEach(note => {
      minPosition = Math.min(note.start, minPosition);
      maxPosition = Math.max(note.end, maxPosition);
    });
  });

  return [minPosition, maxPosition];
}

const horizontalSliderStyle = style({});

export interface GenerateProps {}

@observer
export class Generate extends React.Component<GenerateProps> {
  renderSequences() {
    const noteSequences = generator.candidateSequences;

    const [minPitch, maxPitch] = getPitchRange(noteSequences);
    const [minPosition, maxPosition] = getPositionRange(noteSequences);

    return (
      <div className="sequences-container">
        {noteSequences.map((noteSequence, index) => {
          return (
            <Sequence
              key={index}
              title={index === 0 ? 'original' : ''}
              notes={noteSequence.notes}
              maxPitch={maxPitch}
              minPitch={minPitch}
              maxPosition={maxPosition}
              minPosition={minPosition}
              isSelected={generator.selectedCandidateSequenceIndex === index}
              onSelect={() => generator.selectCandidateSequence(index)}
            />
          );
        })}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => generator.commitSelectedCandidateSequence()}
        >
          Choose
        </Button>
        <div style={{ height: 10 }} />
        <Button
          variant="outlined"
          color="primary"
          onClick={() => generator.clearCandidateSequences()}
        >
          Clear
        </Button>
      </div>
    );
  }

  render() {
    const isModelBusy = !generator.isModelLoaded || generator.isWorking;
    const isGenerateButtonDisabled = !editor.doMasksExist || isModelBusy;

    const nSequenceContainerStyle = style({
      margin: '5px 0 15px',
      width: '100%',
    });

    const showCandidateSequences = generator.candidateSequences.length > 0;

    const maskedSequenceExists = editor.maskedNotes.length > 0;
    const candidateSequenceSelected =
      generator.selectedCandidateSequenceIndex > 0;
    const similaritySliderEnabled = candidateSequenceSelected
      ? true
      : maskedSequenceExists;

    return (
      <div className="container">
        <Button
          disabled={isGenerateButtonDisabled}
          variant="outlined"
          color="primary"
          onClick={() => {
            if (generator.candidateSequences.length) {
              generator.commitSelectedCandidateSequence();
            }
            generator.harmonize();
          }}
        >
          🤖 Generate
          <MusicNote />
        </Button>
        <FormControl classes={{ root: nSequenceContainerStyle }}>
          <Select
            value={generator.nSequencesToGenerate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              if (value !== null) {
                generator.nSequencesToGenerate = Number(value);
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
<<<<<<< HEAD
        <ParameterSlider
          value={generator.conventionalSurprising}
          onChange={newValue => (generator.conventionalSurprising = newValue)}
          range={[MIN_SURPRISE_FACTOR, MAX_SURPRISE_FACTOR]}
          labels={['Conventional', 'Surprising']}
        />
        <ParameterSlider
          value={generator.happySad}
          onChange={newValue => (generator.happySad = newValue)}
          range={[MIN_HAPPY_SAD_FACTOR, MAX_HAPPY_SAD_FACTOR]}
          labels={['😢 Minor', 'Major 😊']}
        />
        <ParameterSlider
          value={generator.differenceFromOriginal}
          onChange={newValue => (generator.differenceFromOriginal = newValue)}
          range={[MIN_DIFFERENCE_FACTOR, MAX_DIFFERENCE_FACTOR]}
          labels={['Similar', 'Different']}
          disabled={!similaritySliderEnabled}
        />
=======
        <div className="horizontal-slider">
          <Slider
            value={generator.conventionalSurprising}
            onChange={(e: any, newValue: number | number[]) => {
              if (newValue !== null) {
                generator.conventionalSurprising = Number(newValue);
              }
            }}
            aria-labelledby="temperature-slider-restrict"
            step={0.1}
            min={MIN_SURPRISE_FACTOR}
            max={MAX_SURPRISE_FACTOR}
          />
          <div className="slider-label">
            <Typography variant="caption">Conventional</Typography>
            <Typography variant="caption">Surprising</Typography>
          </div>
        </div>
        <div className="horizontal-slider">
          <Slider
            value={generator.happySad}
            onChange={(e: any, newValue: number | number[]) => {
              if (newValue !== null) generator.happySad = Number(newValue);
            }}
            step={null}
            marks={HAPPY_SAD_MARKS}
            valueLabelDisplay="off"
            min={MIN_HAPPY_SAD_FACTOR}
            max={MAX_HAPPY_SAD_FACTOR}
          />
          <div className="slider-label">
            <Typography variant="caption">😢 Minor</Typography>
            <Typography variant="caption">Major 😊</Typography>
          </div>
        </div>
        {this.renderSimilaritySlider()}
>>>>>>> added random Chord Triad Progression Priors for maj/min
        {showCandidateSequences && this.renderSequences()}
      </div>
    );
  }
}

interface ParameterSliderProps {
  value: number;
  onChange: (newValue: number) => void;
  range: number[];
  labels: string[];
  disabled?: boolean;
}

function ParameterSlider(props: ParameterSliderProps) {
  const labelColor = props.disabled ? 'textSecondary' : 'textPrimary';

  return (
    <div className="horizontal-slider">
      <Slider
        value={props.value}
        onChange={(e: any, newValue: number | number[]) => {
          if (typeof newValue === 'number') props.onChange(newValue);
        }}
        step={0.1}
        valueLabelDisplay="off"
        min={props.range[0]}
        max={props.range[1]}
        disabled={props.disabled}
      />
      <div className="slider-label">
        <Typography variant="caption" color={labelColor}>
          {props.labels[0]}
        </Typography>
        <Typography variant="caption" color={labelColor}>
          {props.labels[1]}
        </Typography>
      </div>
    </div>
  );
}

ParameterSlider.defaultProps = {
  enabled: true,
};
