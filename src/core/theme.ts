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
