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

import api from './api';
import featureFlags from './feature-flags';
import { getDateString } from './utils';

export const enum Events {
  // Generic Events
  APP_LOAD = 'APP_LOAD',
  // Note edit events
  DRAW_NOTE = 'DRAW_NOTE',
  DELETE_NOTE = 'DELETE_NOTE',
  DELETE_MASKED_NOTES = 'DELETE_MASKED_NOTES',
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
  START_GENERATE = 'START_GENERATE',
  GENERATE = 'GENERATE',
  SET_N_SAMPLES_TO_GENERATE = 'SET_N_SAMPLES_TO_GENERATE',
  SET_CONVENTIONAL_SURPRISING = 'SET_CONVENTIONAL_SURPRISING',
  SET_MAJOR_MINOR = 'SET_MAJOR_MINOR',
  SET_SIMILAR_DIFFERENT = 'SET_SIMILAR_DIFFERENT',
  SELECT_CANDIDATE_SEQUENCE = 'SELECT_CANDIDATE_SEQUENCE',
  CLEAR_CANDIDATE_SEQUENCES = 'CLEAR_CANDIDATE_SEQUENCES',
  CHOOSE_CANDIDATE_SEQUENCE = 'CHOOSE_CANDIDATE_SEQUENCE',
  // Fired when another event triggers committing the candidate sequence,
  // such as drawing a new mask
  IMPLICITLY_COMMIT_CANDIDATE = 'IMPLICITLY_COMMIT_CANDIDATE',
  // Saving state via Ctrl+S
  SAVE_STATE = 'SAVE_STATE',
}

export interface LogEvent {
  event: Events;
  timestamp: number;
  payload?: any;
  id: string;
}

export class LoggingService {
  private logEvents: LogEvent[] = [];
  private sessionId = getDateString();

  logEvent(event: Events, payload: any = undefined) {
    const logEvent: LogEvent = {
      event,
      timestamp: Date.now(),
      id: featureFlags.id,
    };

    if (payload !== undefined) {
      logEvent.payload = payload;
    }

    console.log(event, logEvent);
    this.logEvents.push(logEvent);

    if (featureFlags.firebaseLogging) {
      api.writeLogEvent(this.sessionId, logEvent);
    }
    if (featureFlags.sheetsLogging) {
      this.logToGoogleForm(logEvent);
    }
  }

  private logToGoogleForm(logEvent) {
    (<HTMLTextAreaElement>(
      document.getElementById('sheets-logging-textarea')
    )).value = JSON.stringify(logEvent);
    const form = <HTMLFormElement>(
      document.getElementById('sheets-logging-form')
    );
    form.submit();
    console.log('logged to googleform');
  }
}

export default new LoggingService();
