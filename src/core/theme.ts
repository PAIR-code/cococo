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

import { createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';

const primary = blue;
const secondary = pink;
const error = red;

export const theme = createMuiTheme({
  palette: {
    primary,
    secondary,
    error,
  },
});

export const COLOR_PRIMARY = primary[500];
export const COLOR_PLAYING = secondary[500];
export const COLOR_SELECTED = secondary[500];

export const COLOR_SOPRANO = COLOR_PRIMARY;
export const COLOR_ALTO = primary[700];
export const COLOR_TENOR = primary[800];
export const COLOR_BASS = primary[900];
export const VOICE_COLORS = [
  COLOR_SOPRANO,
  COLOR_ALTO,
  COLOR_TENOR,
  COLOR_BASS,
];
export const MUTED_COLOR = '#aaa';
