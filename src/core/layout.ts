import { computed, observable } from 'mobx';

import { editor } from './index';
import {
  PIANO_ROLL_WIDTH,
  MASK_LANE_HEIGHT,
  TIMELINE_HEIGHT,
} from './constants';

class Layout {
  @observable editorWidth = 1200;
  @observable editorHeight = 600;
  @observable timelineHeight = TIMELINE_HEIGHT;

  @observable maskLanesHeight = 4 * MASK_LANE_HEIGHT;
  @observable pianoRollWidth = PIANO_ROLL_WIDTH;

  @computed get notesHeight() {
    return this.editorHeight - this.timelineHeight - this.maskLanesHeight;
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
