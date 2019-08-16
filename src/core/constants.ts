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

export const MIDDLE_C = 60;
export const BOTTOM_A = 33;

export const N_NOTE_DIVISIONS = 16;

export const MIN_PITCH = 36;
export const MAX_PITCH = 82;
export const NOTE_VELOCITY = 79;
export const DEFAULT_BPM = 80;

export const TOTAL_SIXTEENTHS = 32;

export const SOUNDFONT_URL =
  'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';
export const MODEL_URL =
  'https://storage.googleapis.com/magentadata/js/checkpoints/coconet/bach';

export const DIVISIONS = [4, 8, 12, 16, 20, 24, 28];

// prettier-ignore
export const DEFAULT_NOTES = [
  [72, 4], [74, 2], [76, 2], [74, 6], /* give the impression that a full melody is not required */
  // [77, 2], [79, 4], [74, 2], [76, 2], [72, 8],
];

export const DEFAULT_EDITOR_WIDTH = 1200;
export const DEFAULT_SEQUENCES_WIDTH = 200;

export const PIANO_ROLL_WIDTH = 24;
export const NOTE_HEIGHT = 12;
export const MASK_LANE_HEIGHT = 20;
export const TIMELINE_HEIGHT = 25;
export const TIMELINE_MARGIN = 0;

export const VOICES = ['SOPRANO', 'ALTO', 'TENOR', 'BASS'];

export const MIN_SURPRISE_FACTOR = -3;
export const MAX_SURPRISE_FACTOR = 1;

export enum DifferenceFromOriginal {
  VerySimilar = 0,
  Similar = 1,
  SomewhatDifferent = 2,
  Different = 3,
  VeryDifferent = 4,
}

export const MIN_DIFFERENCE_FACTOR = DifferenceFromOriginal.VerySimilar;
export const MAX_DIFFERENCE_FACTOR = DifferenceFromOriginal.VeryDifferent;

export const MIN_HAPPY_SAD_FACTOR = -1.2;
export const MAX_HAPPY_SAD_FACTOR = 1.2;
export enum Mood {
  SAD = -1,
  NEUTRAL = 0,
  HAPPY = 1,
}
export const HAPPY_SAD_MARKS = [
  { value: Mood.SAD },
  { value: Mood.NEUTRAL },
  { value: Mood.HAPPY },
];

// prettier-ignore
export const KEY_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// prettier-ignore
export const MODE_NAMES = ['major', 'minor', 'harmonic minor'];
