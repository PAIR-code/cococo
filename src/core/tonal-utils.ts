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

import * as tonal from 'tonal';
import {
  BOTTOM_A,
  MIN_PITCH,
  MAX_PITCH,
  MODE_NAMES,
  KEY_NAMES,
} from './constants';
import { range } from 'lodash';
import { ScaleValue } from './editor';

export function getNoteDetails(noteValue: number) {
  const noteText = tonal.Note.fromMidi(noteValue);
  const letter = noteText[0];
  const accidental = noteText.length > 2 ? noteText[1] : '';
  const octave = Number(noteText[noteText.length - 1]);

  return { letter, accidental, octave };
}

const RAW_NOTE_NAMES = 'ABCDEFG';
const { octave: BOTTOM_A_OCTAVE } = getNoteDetails(BOTTOM_A);

export function getStaffLineNumber(name: string, octave: number) {
  const deltaOctave = octave - BOTTOM_A_OCTAVE;
  const deltaNote = RAW_NOTE_NAMES.indexOf(name) - RAW_NOTE_NAMES.indexOf('A');

  return deltaOctave * 7 + deltaNote;
}

export function getNoteDetailsFromLine(lineDivision: number) {
  const name = RAW_NOTE_NAMES[lineDivision % 7];
  const octave = Math.floor(lineDivision / 7) + BOTTOM_A_OCTAVE;
  return { name, octave };
}

export function makeNoteScale(max = MAX_PITCH, min = MIN_PITCH): ScaleValue[] {
  return range(max, min - 1 /* inclusive */).map(pitch => {
    const { letter, accidental, octave } = getNoteDetails(pitch);
    return {
      pitch,
      name: `${letter}${accidental}`,
      octave,
    };
  });
}

export function makeNoteScaleForKey(key: string, mode: string): ScaleValue[] {
  const scaleNotes = new Set<string>(tonal.Scale.notes(key, mode));
  const scale = makeNoteScale(MIN_PITCH, MAX_PITCH);
  return scale.filter(note => {
    const { pitch } = note;
    const { accidental, letter } = getNoteDetails(pitch);
    const name = `${letter}${accidental}`;
    const alternate = tonal.Note.enharmonic(name);
    return scaleNotes.has(name) || scaleNotes.has(alternate);
  });
}

const CHORD_MODES = new Set<string>(['M', 'm', 'dim', 'aug']);

// source:
// https://en.wikipedia.org/wiki/Roman_numeral_analysis#/media/File:Roman_numeral_analysis_major,_natural_minor,_harmonic_minor,_melodic_minor.png
const TRIAD_QUALITIES = {
  major: ['M', 'm', 'm', 'M', 'M', 'm', 'm'],
  minor: ['m', 'dim', 'M', 'm', 'm', 'M', 'M'],
  'harmonic minor': ['m', 'dim', 'aug', 'm', 'M', 'M', 'dim'],
};

export function makeNotesTriadForKey(key: string, mode: string): ScaleValue[] {
  if (!CHORD_MODES.has(mode)) {
    console.error(
      `Violated contract for makeNotesTriadForKey; (mode = ${mode}) is not one of ${JSON.stringify(
        CHORD_MODES
      )}`
    );
    return;
  }
  const chordNotes = new Set<string>(tonal.Chord.notes(key, mode));
  const scale = makeNoteScale(MIN_PITCH, MAX_PITCH);
  return scale.filter(note => {
    const { pitch } = note;
    const { accidental, letter } = getNoteDetails(pitch);
    const name = `${letter}${accidental}`;
    const alternate = tonal.Note.enharmonic(name);
    return chordNotes.has(name) || chordNotes.has(alternate);
  });
}

interface TriadValue {
  key: string;
  quality: string;
}

export function getTriadsForKey(key: string, mode: string): TriadValue[] {
  if (!MODE_NAMES.includes(mode)) {
    console.error(
      `Violated contract for getTriadsForKey; (mode = ${mode}) is not one of ${JSON.stringify(
        CHORD_MODES
      )}`
    );
    return;
  }
  const scaleNotes = tonal.Scale.notes(key, mode);
  return scaleNotes.map((noteName, i) => {
    // zip together note key names and the qualities
    return {
      key: noteName,
      quality: TRIAD_QUALITIES[mode][i],
    };
  });
}

export function getHappyTriadsForKey(key: string, mode: string): TriadValue[] {
  const triads = getTriadsForKey(key, mode);
  return triads.filter(triad => {
    return triad.quality === 'M';
  });
}

export function getSadTriadsForKey(key: string, mode: string): TriadValue[] {
  const triads = getTriadsForKey(key, mode);
  return triads.filter(triad => {
    // TODO: could semantically separate m, aug, dim
    return triad.quality !== 'M';
  });
}

export function getAllHappyTriads(): TriadValue[] {
  return KEY_NAMES.map(keyName => {
    return {
      key: keyName,
      quality: 'M',
    };
  });
}

export function getAllSadTriads(): TriadValue[] {
  const nonMajorQualities = ['m', 'aug', 'dim'];
  const triads: TriadValue[] = [];
  KEY_NAMES.forEach(keyName => {
    nonMajorQualities.forEach(quality => {
      triads.push({ key: keyName, quality: quality });
    });
  });
  return triads;
}
