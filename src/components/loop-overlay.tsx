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
import { observer } from 'mobx-react';

import { engine, editor } from '../core';

import { Group } from './group';

export interface Props {
  width: number;
  height: number;
}

@observer
export class LoopOverlay extends React.Component<Props> {
  render() {
    const { width, height } = this.props;
    const startX = (width / editor.totalSixteenths) * engine.loopStart - 1;
    const endX = (width / editor.totalSixteenths) * engine.loopEnd - 1;

    return (
      <Group>
        <rect
          key="loop-border-left"
          x={0}
          y={0}
          height={height}
          width={Math.max(startX, 0)}
          fill={'black'}
          fillOpacity={0.1}
        />
        <rect
          key="loop-border-right"
          x={endX}
          y={0}
          height={height}
          width={Math.max(width - endX, 0)}
          fill={'black'}
          fillOpacity={0.1}
        />
      </Group>
    );
  }
}
