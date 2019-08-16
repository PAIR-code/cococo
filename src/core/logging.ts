import { observable } from 'mobx';

export const enum Events {
  // Generic Events
  APP_LOAD = 'APP_LOAD',
  // Note edit events
  DRAW_NOTE = 'DRAW_NOTE',
  DELETE_NOTE = 'DELETE_NOTE',
  MOVE_NOTE = 'MOVE_NOTE',
  // Play pause events
  PLAY = 'PLAY',
  STOP = 'STOP',
  // Undo / Redo
  UNDO = 'UNDO',
  REDO = 'REDO',
  // Tool selection
  SELECT_TOOL = 'SELECT_TOOL',
  // Voice / Quantization
  SELECT_VOICE = 'SELECT_VOICE',
  SELECT_QUANTIZATION = 'SELECT_QUANTIZATION',
  // Key / mode
  SELECT_KEY = 'SELECT_KEY',
  SELECT_MODE = 'SELECT_MODE',
  SET_CONSTRAIN_TO_KEY = 'SET_CONSTRAIN_TO_KEY',
  // Masking
  USE_MASK_TOOL = 'USE_MASK_TOOL',
  USE_MASK_LANE = 'USE_MASK_LANE',
  // Mute / Unmute
  MUTE_VOICE = 'MUTE_VOICE',
  UNMUTE_VOICE = 'UNMUTE_VOICE',
  // Looping
  CHANGE_LOOP = 'CHANGE_LOOP',
  // Pianoroll
  PRESS_PIANOROLL = 'PRESS_PIANOROLL',
  // Generation
  GENERATE = 'GENERATE',
  SET_N_SAMPLES_TO_GENERATE = 'SET_N_SAMPLES_TO_GENERATE',
  SET_CONVENTIONAL_SURPRISING = 'SET_CONVENTIONAL_SURPRISING',
  SET_MAJOR_MINOR = 'SET_MAJOR_MINOR',
  SET_SIMILAR_DIFFERENT = 'SET_SIMILAR_DIFFERENT',
  SELECT_CANDIDATE_SEQUENCE = 'SELECT_CANDIDATE_SEQUENCE',
  CLEAR_CANDIDATE_SEQUENCES = 'CLEAR_CANDIDATE_SEQUENCES',
  CHOOSE_CANDIDATE_SEQUENCE = 'CHOOSE_CANDIDATE_SEQUENCE',
}

export interface LogEvent {
  event: Events;
  timestamp: number;
  payload: any;
}

export class LoggingService {
  private logEvents: LogEvent[] = [];

  logEvent(event: Events, payload: any = undefined) {
    const logEvent = {
      event,
      timestamp: Date.now(),
      payload,
    };
    console.log(event, logEvent);

    this.logToGoogleForm(logEvent);
    this.logEvents.push(logEvent);
  }

  private logToGoogleForm(logEvent) {
    (<HTMLTextAreaElement>(
      document.getElementById('submitbox')
    )).value = JSON.stringify(logEvent);
    var form = <HTMLFormElement>document.getElementById('form');
    form.submit();
    console.log('logged to googleform');
  }
  private getDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    return `${year}-${month}-${day}_${hour}:${minute}:${second}`;
  }

  saveLogsToJSON() {
    const json = JSON.stringify(this.logEvents);
    const blob = new Blob([json], { type: 'application/json' });
    const filename = `cococo_logs_${this.getDateString()}`;
    this.downloadBlob(blob, filename);
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

export default new LoggingService();
