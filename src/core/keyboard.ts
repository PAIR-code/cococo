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

import player from './player';
import editor, { EditorTool } from './editor';
import saveLoad from './save-load';
import undo from './undo';
import { Voice } from './note';
import { debounce } from 'lodash';

const DEBOUNCE_TIME_MS = 100;

class KeyboardManager {
  constructor() {
    document.addEventListener('keydown', this.handleKeyDown, false);
  }

  handlePlayPause = debounce(() => {
    player.togglePlay();
  }, DEBOUNCE_TIME_MS);

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      this.handlePlayPause();
    } else if (e.key === 's' && !e.metaKey) {
      editor.selectVoice(Voice.SOPRANO);
      editor.selectTool(EditorTool.DRAW, false /** logging */);
    } else if (e.key === 'a' && !e.metaKey) {
      editor.selectVoice(Voice.ALTO);
      editor.selectTool(EditorTool.DRAW, false /** logging */);
    } else if (e.key === 't' && !e.metaKey) {
      editor.selectVoice(Voice.TENOR);
      editor.selectTool(EditorTool.DRAW, false /** logging */);
    } else if (e.key === 'b' && !e.metaKey) {
      editor.selectVoice(Voice.BASS);
      editor.selectTool(EditorTool.DRAW, false /** logging */);
    } else if (e.key === 'z' && e.metaKey && !e.shiftKey) {
      undo.undo();
    } else if (e.key === 'z' && e.metaKey && e.shiftKey) {
      undo.redo();
    } else if (e.key === 's' && e.metaKey) {
      e.preventDefault();
      saveLoad.saveJSON();
      return false;
    } else if (e.key === 'l' && e.metaKey) {
      e.preventDefault();
      saveLoad.loadJSON();
      return false;
    }
  };
}

export default new KeyboardManager();
