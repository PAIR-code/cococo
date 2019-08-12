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

import * as mm from '@magenta/music';
import { Note, Source } from './note';

/**
 * NOTE: duplicate of trim wrapper function in magent.music.sequences
 *
 * Trim notes from a NoteSequence to lie within a specified time range.
 * Notes starting before `start` are not included. Notes ending after
 * `end` are not included, unless `truncateEndNotes` is true.
 * @param ns The NoteSequence for which to trim notes.
 * @param start The time after which all notes should begin. This should be
 * either seconds (if ns is unquantized), or a quantized step (if ns is
 * quantized).
 * @param end The time before which all notes should end. This should be
 * either seconds (if ns is unquantized), or a quantized step (if ns is
 * quantized).
 * @param truncateEndNotes Optional. If true, then notes starting before
 * the end time but ending after it will be included and truncated.
 * @returns A new NoteSequence with all notes trimmed to lie between `start`
 * and `end`, and time-shifted to begin at 0.
 */
export function trim(
  ns: mm.INoteSequence,
  start: number,
  end: number,
  truncateEndNotes?: boolean
) {
  return mm.sequences.isQuantizedSequence(ns)
    ? trimHelper(
        ns,
        start,
        end,
        'totalQuantizedSteps',
        'quantizedStartStep',
        'quantizedEndStep',
        truncateEndNotes
      )
    : trimHelper(
        ns,
        start,
        end,
        'totalTime',
        'startTime',
        'endTime',
        truncateEndNotes
      );
}

// CHANGELOG from magenta/music/sequences.ts:
// (1) notes filtered to when note[startKey] < end (exclusive instead of inclusive).
// This correctly excludes notes that would have started on the end limit
function trimHelper(
  ns: mm.INoteSequence,
  start: number,
  end: number,
  totalKey: 'totalQuantizedSteps' | 'totalTime',
  startKey: 'startTime' | 'quantizedStartStep',
  endKey: 'endTime' | 'quantizedEndStep',
  truncateEndNotes?: boolean
) {
  const result = mm.sequences.clone(ns);
  result[totalKey] = end;
  //
  result.notes = result.notes.filter(
    n =>
      n[startKey] >= start &&
      n[startKey] < end &&
      (truncateEndNotes || n[endKey] <= end)
  );

  // Shift the sequence to start at 0.
  for (let i = 0; i < result.notes.length; i++) {
    result.notes[i][startKey] -= start;
    result.notes[i][endKey] -= start;

    if (truncateEndNotes) {
      result.notes[i][endKey] = Math.min(result.notes[i][endKey], end);
    }
  }
  result[totalKey] = Math.min(ns[totalKey] - start, end);
  return result;
}

export function fromMagentaSequence(
  sequence: mm.NoteSequence,
  source = Source.AGENT
): Note[] {
  return sequence.notes.map(item => {
    const position = item.quantizedStartStep;
    const duration = item.quantizedEndStep - item.quantizedStartStep;
    const voice = item.instrument;
    const note = new Note(item.pitch, position, duration, source, voice);
    return note;
  });
}

export function getMagentaNoteSequence(
  notes: Note[],
  bpm: number,
  totalSixteenths: number,
  merge = false
) {
  const noteSequence = {
    notes: notes.map(note => note.magentaNote),
    tempos: [{ time: 0, qpm: bpm }],
    totalQuantizedSteps: totalSixteenths,
    quantizationInfo: { stepsPerQuarter: 4 },
  };
  return merge
    ? mm.sequences.mergeConsecutiveNotes(noteSequence)
    : mm.sequences.clone(noteSequence);
}
