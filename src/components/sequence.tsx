import React from 'react';
import { observer } from 'mobx-react';

import { layout, Note } from '../core';
import { VOICE_COLORS, COLOR_SELECTED } from '../core/theme';

import { Group } from './group';

export interface SequenceProps {
  notes: Note[];
  minPitch: number;
  maxPitch: number;
  minPosition: number;
  maxPosition: number;
  isSelected: boolean;
  onSelect: () => void;
}

const MIN_PITCH_RANGE = 12;
const MIN_POSITION_RANGE = 4;

@observer
export class Sequence extends React.Component<SequenceProps> {
  renderNotes() {
    const { minPitch, maxPitch, minPosition, maxPosition, notes } = this.props;
    const pitchRange = maxPitch - minPitch;
    const positionRange = maxPosition - minPosition;
    const padding = 2;
    const height = layout.sequenceHeight - 2 * padding;
    const width = layout.sequencesWidth - 2 * padding;

    const pitchHeight = height / Math.max(pitchRange, MIN_PITCH_RANGE);
    const sixteenthWidth = width / Math.max(positionRange, MIN_POSITION_RANGE);

    return (
      <Group x={padding} y={padding}>
        {notes.map(note => {
          const x = (note.position - minPosition) * sixteenthWidth;
          const y = height - (note.pitch - minPitch + 1) * pitchHeight;
          const offsetY = y;
          return (
            <rect
              key={note.id}
              x={x}
              y={offsetY}
              height={pitchHeight}
              width={sixteenthWidth * note.duration}
              fill={VOICE_COLORS[note.voice]}
            />
          );
        })}
      </Group>
    );
  }

  render() {
    const { isSelected, notes, onSelect } = this.props;
    const isEmpty = notes.length === 0;

    const border = isSelected
      ? `2px solid ${COLOR_SELECTED}`
      : '1px solid gray';
    return (
      <svg
        width={layout.sequencesWidth}
        height={layout.sequenceHeight}
        style={{ border, marginBottom: 10, boxSizing: 'border-box' }}
        onClick={onSelect}
      >
        {!isEmpty && this.renderNotes()}
      </svg>
    );
  }
}
