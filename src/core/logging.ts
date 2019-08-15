import { observable } from 'mobx';

export const enum Events {
  // Note edit events
  ADD_NOTE = 'ADD_NOTE',
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
    this.logEvents.push(logEvent);
  }

  @observable isLoggingDialogOpen = false;

  openLoggingDialog() {
    this.isLoggingDialogOpen = true;
  }

  closeLoggingDialog() {
    this.isLoggingDialogOpen = false;
  }
}

export default new LoggingService();
