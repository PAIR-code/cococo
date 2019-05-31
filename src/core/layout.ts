import { computed, observable } from 'mobx';

import { editor } from './index';
import { PIANO_ROLL_WIDTH } from './constants';

class Layout {
  @observable stageWidth = 1200;
  @observable stageHeight = 600;

  @observable timelineHeight = 20;
  @observable pianoRollWidth = PIANO_ROLL_WIDTH;

  @computed get notesHeight() {
    return this.stageHeight - this.timelineHeight;
  }

  @computed get noteHeight() {
    return this.notesHeight / editor.scale.length;
  }

  @computed get sixteenthWidth() {
    return this.stageWidth / editor.totalSixteenths;
  }
}

export default new Layout();
