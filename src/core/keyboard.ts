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
import undo from './undo';
import { Voice } from './note';

class KeyboardManager {
  constructor() {
    document.addEventListener('keypress', this.handleKeyPress);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'z' && e.metaKey && !e.shiftKey) {
      undo.undo();
    } else if (e.key === 'z' && e.metaKey && e.shiftKey) {
      undo.redo();
    }
  };

  handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      player.togglePlay();
    } else if (e.key === 's') {
      editor.selectedVoice = Voice.SOPRANO;
      editor.selectedTool = EditorTool.DRAW; // selecting voices means only you want to draw
    } else if (e.key === 'a') {
      editor.selectedVoice = Voice.ALTO;
      editor.selectedTool = EditorTool.DRAW; // selecting voices means only you want to draw
    } else if (e.key === 't') {
      editor.selectedVoice = Voice.TENOR;
      editor.selectedTool = EditorTool.DRAW; // selecting voices means only you want to draw
    } else if (e.key === 'b') {
      editor.selectedVoice = Voice.BASS;
      editor.selectedTool = EditorTool.DRAW; // selecting voices means only you want to draw
    }
  };
}

export default new KeyboardManager();
