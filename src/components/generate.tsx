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

import { editor, engine, sequences, Note } from '../core';
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
    const noteSequences = sequences.candidateSequences;

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
    const maskedSequenceExists = editor.maskedNotes.length > 0;
    const candidateSequenceSelected =
      sequences.selectedCandidateSequenceIndex > 0;
    const enabled = candidateSequenceSelected ? true : maskedSequenceExists;
    const labelColor = enabled ? 'textPrimary' : 'textSecondary';
    return (
      <div className="horizontal-slider">
        <Slider
          value={sequences.differenceFromOriginal}
          onChange={(e: any, newValue: number | number[]) => {
            if (newValue !== null) {
              sequences.differenceFromOriginal = Number(newValue);
            }
          }}
          step={0.1}
          valueLabelDisplay="off"
          min={MIN_DIFFERENCE_FACTOR}
          max={MAX_DIFFERENCE_FACTOR}
          disabled={!enabled}
        />
        <div className="slider-label">
          <Typography variant="caption" color={labelColor}>
            Similar
          </Typography>
          <Typography variant="caption" color={labelColor}>
            Different
          </Typography>
        </div>
      </div>
    );
  }

  render() {
    const isEngineBusy = !engine.isModelLoaded || engine.isWorking;
    const isGenerateButtonDisabled = !editor.doMasksExist || isEngineBusy;

    const nSequenceContainerStyle = style({
      margin: '5px 0 15px',
      width: '100%',
    });

    const showCandidateSequences = sequences.candidateSequences.length > 0;

    return (
      <div className="container">
        <Button
          disabled={isGenerateButtonDisabled}
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
        <FormControl classes={{ root: nSequenceContainerStyle }}>
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
        <div className="horizontal-slider">
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
          <div className="slider-label">
            <Typography variant="caption">Conventional</Typography>
            <Typography variant="caption">Surprising</Typography>
          </div>
        </div>
        <div className="horizontal-slider">
          <Slider
            value={sequences.happySad}
            onChange={(e: any, newValue: number | number[]) => {
              if (newValue !== null) sequences.happySad = Number(newValue);
            }}
            step={0.1}
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
        {showCandidateSequences && this.renderSequences()}
      </div>
    );
  }
}
