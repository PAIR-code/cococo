import { undo, editor, player } from '../core';
import { getDateString } from './utils';
import featureFlags from './feature-flags';
import logging, { Events } from './logging';
import { sequenceProtoToMidi } from '@magenta/music';
import { getMagentaNoteSequence } from './magenta-utils';

export class SaveLoad {
  saveJSON() {
    const state = undo.getUndoStep();
    logging.logEvent(Events.SAVE_STATE, state);
    const json = JSON.stringify(state);
    const blob = new Blob([json], { type: 'application/json' });
    const ffMeta = `${featureFlags.id}_variant-${featureFlags.variant}`;
    this.downloadBlob(blob, `cococo_state_${getDateString()}_${ffMeta}`);
  }

  saveMIDI() {
    const inputNotes = [...editor.allNotes];
    const sequence = getMagentaNoteSequence(
      inputNotes,
      player.bpm,
      editor.totalSixteenths,
      true
    );
    const blob = new Blob([sequenceProtoToMidi(sequence)], { type: 'audio/midi' });
    this.downloadBlob(blob, `cococo_music_${getDateString()}`);
  }

  loadJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.click();

    input.onchange = (e: any) => {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = (readerEvent: any) => {
        var content = readerEvent.target.result;
        const state = JSON.parse(content);
        console.log(state);
        undo.rehydrateStep(state);
      };
    };
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';

    const clickHandler = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.removeEventListener('click', clickHandler);
      }, 150);
    };

    a.addEventListener('click', clickHandler, false);
    a.click();
  }
}

export default new SaveLoad();
