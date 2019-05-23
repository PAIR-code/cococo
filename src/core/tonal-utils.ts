import * as tonal from 'tonal';
import { BOTTOM_A } from './constants';
import { range } from 'lodash';

export function getNoteDetails(noteValue: number) {
  const noteText = tonal.Note.fromMidi(noteValue);
  const name = noteText[0];
  const accidental = noteText.length > 2 ? noteText[1] : '';
  const octave = Number(noteText[noteText.length - 1]);

  return { name, accidental, octave };
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

export function makeNoteScale(max = 81, min = 36) {
  return range(max, min).map(value => {
    const name = tonal.Note.fromMidi(value);
    return {
      value,
      name,
    };
  });
}
