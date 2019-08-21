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
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { MusicNote } from '@material-ui/icons';

import { editor, generator, masks } from '../core';
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
  TOTAL_SIXTEENTHS,
} from '../core/constants';

import './generate.css';
import featureFlags from '../core/feature-flags';

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
      </div>
    );
  }

  render() {
    const { baseline } = featureFlags;
    const isModelBusy = !generator.isModelLoaded || generator.isWorking;
    const noMasks = baseline ? !masks.doAnyMasksExist : !masks.doUserMasksExist;
    const noInputNotes = editor.allNotes.length === 0;
    const isGenerateButtonDisabled = noMasks || isModelBusy || noInputNotes;

    const nSequenceContainerStyle = style({
      margin: '5px 0 15px',
      width: '100%',
    });

    const showCandidateSequences =
      !baseline && generator.candidateSequences.length > 0;

    const maskedSequenceExists = masks.maskedNotes.length > 0;
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
            generator.generate();
          }}
        >
          🤖 Generate
          <MusicNote />
        </Button>
        {baseline ? null : (
          <FormControl classes={{ root: nSequenceContainerStyle }}>
            <Select
              value={generator.nSequencesToGenerate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (value !== null) {
                  generator.setNSequencesToGenerate(Number(value));
                }
              }}
              disabled={baseline}
              autoWidth
            >
              <MenuItem value={1}>1 sequence</MenuItem>
              <MenuItem value={2}>2 sequences</MenuItem>
              <MenuItem value={3}>3 sequences</MenuItem>
              <MenuItem value={4}>4 sequences</MenuItem>
            </Select>
          </FormControl>
        )}
        {baseline ? null : (
          <>
            <ParameterSlider
              value={generator.conventionalSurprising}
              onChange={newValue =>
                generator.setConventionalSurprising(newValue)
              }
              range={[MIN_SURPRISE_FACTOR, MAX_SURPRISE_FACTOR]}
              labels={['Conventional', 'Surprising']}
              nMarks={3}
            />
            <ParameterSlider
              value={generator.majorMinor}
              onChange={newValue => generator.setMajorMinor(newValue)}
              range={[MIN_HAPPY_SAD_FACTOR, MAX_HAPPY_SAD_FACTOR]}
              labels={['😢 Minor', 'Major 😊']}
              nMarks={3}
            />
            <ParameterSlider
              value={generator.differenceFromOriginal}
              onChange={newValue =>
                generator.setDifferenceFromOriginal(newValue)
              }
              range={[MIN_DIFFERENCE_FACTOR, MAX_DIFFERENCE_FACTOR]}
              labels={['Similar', 'Different']}
              disabled={!similaritySliderEnabled}
              nMarks={3}
            />
          </>
        )}
        {showCandidateSequences && (
          <>
            {this.renderSequences()}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => generator.commitSelectedCandidateSequence()}
            >
              Choose
            </Button>
          </>
        )}
      </div>
    );
  }
}

const MarkedSlider = withStyles({
  mark: {
    backgroundColor: '#bfbfbf',
    height: 8,
    width: 4,
    marginTop: -3,
    marginLeft: -2, // half of width to make it centered
  },
  markActive: {
    backgroundColor: 'currentColor',
  },
})(Slider);

interface ParameterSliderProps {
  value: number;
  onChange: (newValue: number) => void;
  range: number[];
  labels: string[];
  disabled?: boolean;
  nMarks?: number;
}

function ParameterSlider(props: ParameterSliderProps) {
  const labelColor = props.disabled ? 'textSecondary' : 'textPrimary';

  const deltaRange = props.range[1] - props.range[0];
  const marks = _.range(props.nMarks).map(index => {
    const value = props.range[0] + (deltaRange / (props.nMarks - 1)) * index;
    return { value };
  });

  return (
    <div className="horizontal-slider">
      <MarkedSlider
        value={props.value}
        onChange={(e: any, newValue: number | number[]) => {
          if (typeof newValue === 'number') props.onChange(newValue);
        }}
        step={0.1}
        valueLabelDisplay="off"
        min={props.range[0]}
        max={props.range[1]}
        disabled={props.disabled}
        marks={marks}
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
