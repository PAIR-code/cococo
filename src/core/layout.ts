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

import editor from './editor';
import featureFlags from './feature-flags';
import {
  DEFAULT_EDITOR_WIDTH,
  DEFAULT_SEQUENCES_WIDTH,
  PIANO_ROLL_WIDTH,
  MASK_LANE_HEIGHT,
  LOOP_HANDLE_HEIGHT,
  LOOP_HANDLE_MARGIN,
} from './constants';

class Layout {
  constructor() {
    window.onresize = () => this.handleResize();
    this.handleResize();
  }

  computeEditorHeight() {
    const editorContainer = document.getElementById('editor-container');
    if (editorContainer) {
      const { height } = editorContainer.getBoundingClientRect();
      this.editorHeight = height;
    }
  }

  handleResize() {
    const { innerWidth } = window;
    const defaultAppWidth = DEFAULT_EDITOR_WIDTH + DEFAULT_SEQUENCES_WIDTH;
    const appWidth = Math.min(innerWidth, defaultAppWidth);

    this.sequencesWidth = DEFAULT_SEQUENCES_WIDTH;
    this.editorWidth = appWidth - this.sequencesWidth;
  }

  @observable editorHeight = 0;
  @observable editorWidth = 1200;

  @observable controlsHeight = 50;
  @observable sequencesWidth = 200;
  @observable sequenceHeight = 80;
  @observable loopHandleHeight = LOOP_HANDLE_HEIGHT;
  @observable loopHandleMargin = LOOP_HANDLE_MARGIN;

  @computed get maskLanesHeight() {
    return featureFlags.baseline ? 0 : 4 * MASK_LANE_HEIGHT;
  }

  @computed get pianoRollWidth() {
    const computedWidth = this.editorHeight / 20;
    return Math.max(PIANO_ROLL_WIDTH, computedWidth);
  }

  @computed get notesHeight() {
    return (
      this.editorHeight -
      this.loopHandleHeight -
      this.maskLanesHeight -
      this.loopHandleMargin
    );
  }

  @computed get notesWidth() {
    return this.editorWidth - this.pianoRollWidth;
  }

  @computed get noteHeight() {
    return this.notesHeight / editor.scale.length;
  }

  @computed get sixteenthWidth() {
    return this.notesWidth / editor.totalSixteenths;
  }

  @computed get maskLanesY() {
    return this.loopHandleHeight + this.loopHandleMargin;
  }

  @computed get notesY() {
    return this.maskLanesY + this.maskLanesHeight;
  }
}

export default new Layout();
