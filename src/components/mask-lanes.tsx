import React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { editor, interactions } from '../core';
import { VOICE_COLORS } from '../core/theme';

import { Group } from './group';

export interface Props {
  width: number;
  height: number;
  labelWidth: number;
}

const VOICE_INITIALS = ['S', 'A', 'T', 'B'];

@observer
export class MaskLanes extends React.Component<Props> {
  renderLabels() {
    const { height, labelWidth } = this.props;

    return _.range(4).map(voiceIndex => {
      const laneHeight = height / 4;
      const y = voiceIndex * laneHeight;
      return (
        <text
          className="mask-lane-label"
          key={`label_${voiceIndex}`}
          x={4}
          y={y + 14}
          height={laneHeight}
          width={labelWidth}
          fill={VOICE_COLORS[voiceIndex]}
        >
          {VOICE_INITIALS[voiceIndex]}
        </text>
      );
    });
  }

  renderLanes() {
    const { height, width } = this.props;
    const laneHeight = height / 4;

    return _.range(4).map(voiceIndex => {
      const y = voiceIndex * laneHeight;
      return (
        <rect
          key={`lane_${voiceIndex}`}
          x={0}
          y={y}
          height={laneHeight}
          width={width}
          fill={VOICE_COLORS[voiceIndex]}
          onMouseDown={interactions.handleMaskLaneMouseDown(voiceIndex)}
        />
      );
    });
  }

  renderMasks() {
    const { height, width } = this.props;
    const laneHeight = height / 4;

    return _.range(4).map(voiceIndex => {
      const mask = editor.generationMasks[voiceIndex];
      const y = voiceIndex * laneHeight;

      // Merge the mask indices into left/right bounds in order to draw
      // contiguous rectangles for masked regions.
      type Bound = { start: number; end: number };
      const maskBounds: Bound[] = [];

      let currentBound: Bound | null = null;
      mask.forEach((maskIndex, arrIndex) => {
        const neighborLeft =
          arrIndex > 0 && mask[arrIndex - 1] === maskIndex - 1;

        if (!currentBound || !neighborLeft) {
          currentBound = { start: maskIndex, end: maskIndex };
          maskBounds.push(currentBound);
          return;
        } else {
          currentBound.end = maskIndex;
        }
      });

      return maskBounds.map((bounds, boundsIndex) => {
        const BORDER = 2;

        const x = (width / editor.totalSixteenths) * bounds.start;
        const rectWidth =
          (width / editor.totalSixteenths) * (bounds.end - bounds.start + 1) -
          2 * BORDER;
        const maskIndices = _.range(bounds.start, bounds.end + 1);

        return (
          <rect
            key={`lane_${voiceIndex}_mask_${boundsIndex}`}
            x={x + BORDER}
            y={y + BORDER}
            height={laneHeight - 2 * BORDER}
            width={rectWidth}
            stroke={'white'}
            strokeWidth={2}
            fill={'rgba(0,0,0,0)'}
            onClick={interactions.handleMaskRectClick(voiceIndex, maskIndices)}
            onMouseDown={interactions.handleMaskLaneMouseDown(voiceIndex)}
          />
        );
      });
    });
  }

  render() {
    const { labelWidth } = this.props;

    return (
      <Group>
        {this.renderLabels()}
        <Group x={labelWidth}>{this.renderLanes()}</Group>
        <Group x={labelWidth}>{this.renderMasks()}</Group>
      </Group>
    );
  }
}
