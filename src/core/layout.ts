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

import { computed, observable } from 'mobx';

import { editor } from './index';
import {
  DEFAULT_EDITOR_WIDTH,
  DEFAULT_SEQUENCES_WIDTH,
  PIANO_ROLL_WIDTH,
  MASK_LANE_HEIGHT,
  TIMELINE_HEIGHT,
} from './constants';

class Layout {
  constructor() {
    window.onresize = () => this.handleResize();
    this.handleResize();
  }

  handleResize() {
    const { innerWidth, innerHeight } = window;
    const defaultAppWidth = DEFAULT_EDITOR_WIDTH + DEFAULT_SEQUENCES_WIDTH;
    const appWidth = Math.min(innerWidth, defaultAppWidth);

    this.sequencesWidth = DEFAULT_SEQUENCES_WIDTH;
    this.editorWidth = appWidth - this.sequencesWidth;

    console.log({ innerWidth, appWidth, sequencesWidth: this.sequencesWidth });
  }

  @observable editorWidth = 1200;
  @observable sequencesWidth = 200;
  @observable sequenceHeight = 80;
  @observable editorHeight = 600;
  @observable timelineHeight = TIMELINE_HEIGHT;

  @observable maskLanesHeight = 4 * MASK_LANE_HEIGHT;
  @observable pianoRollWidth = PIANO_ROLL_WIDTH;

  @computed get notesHeight() {
    return this.editorHeight - this.timelineHeight - this.maskLanesHeight;
  }

  @computed get notesWidth() {
    return this.editorWidth - this.pianoRollWidth;
  }

  @computed get noteHeight() {
    return this.notesHeight / editor.scale.length;
  }

  @computed get sixteenthWidth() {
    return this.editorWidth / editor.totalSixteenths;
  }

  @computed get maskLanesY() {
    return this.timelineHeight;
  }

  @computed get notesY() {
    return this.maskLanesY + this.maskLanesHeight;
  }
}

export default new Layout();
