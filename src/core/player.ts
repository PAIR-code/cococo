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

import * as mm from '@magenta/music';
import { observable } from 'mobx';
import { Note } from './note';
import { editor } from './index';
import { range } from 'lodash';
import * as Tone from 'tone';
import { trim, getMagentaNoteSequence } from './magenta-utils';

import {
  DEFAULT_BPM,
  MIN_PITCH,
  MAX_PITCH,
  NOTE_VELOCITY,
  SOUNDFONT_URL,
  TOTAL_SIXTEENTHS,
} from './constants';

export class CallbackObject extends mm.BasePlayerCallback {
  constructor(private player: Player) {
    super();
  }

  run(note: mm.NoteSequence.INote, t: number) {
    const { pitch, quantizedStartStep } = note;

    // this offsets the position by loopStart, so that the notes correspond to the notes in the notesMap
    // which allows the notes to be highlighted red for playing
    editor.setNotePlaying(pitch, quantizedStartStep + this.player.loopStart);
  }
  stop() {
    if (this.player.shouldLoop) {
      this.player.loop();
    } else {
      this.player.stop();
    }
  }
}

class Player {
  playerCallbackObject = new CallbackObject(this);
  @observable isPlayerLoaded = false;
  @observable isPlaying = false;

  @observable shouldLoop = true;

  @observable loopStart = 0;
  @observable loopEnd = TOTAL_SIXTEENTHS;

  private player = new mm.SoundFontPlayer(
    SOUNDFONT_URL,
    Tone.master,
    undefined,
    undefined,
    this.playerCallbackObject
  );

  @observable bpm = DEFAULT_BPM;

  constructor() {
    this.loadPlayer();
  }

  async loadPlayer() {
    const allNotes: mm.NoteSequence.INote[] = range(
      MIN_PITCH,
      MAX_PITCH + 1
    ).map(pitch => ({
      pitch,
      velocity: NOTE_VELOCITY,
    }));
    const allNotesSeq = { notes: allNotes };
    await this.player.loadSamples(allNotesSeq);
    this.isPlayerLoaded = true;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  playNote(note: Note) {
    if (this.isPlayerLoaded) {
      this.playNoteDown(note);
      const timePerSixteenth = (((1 / this.bpm) * 60) / 4) * 1000;
      const delay = note.duration * timePerSixteenth;
      setTimeout(() => this.playNoteUp(note), delay);
    }
  }

  playNoteDown(note: Note) {
    if (this.isPlayerLoaded) {
      editor.activeNoteValue = note.pitch;
      this.player.playNoteDown(note.magentaNote);
    }
  }

  playNoteUp(note: Note) {
    if (this.isPlayerLoaded) {
      editor.activeNoteValue = null;
      this.player.playNoteUp(note.magentaNote);
    }
  }

  start() {
    if (this.isPlayerLoaded) {
      if (editor.allNotes.length === 0) {
        return;
      }

      const sequence = getMagentaNoteSequence(
        editor.unmutedNotes,
        this.bpm,
        editor.totalSixteenths
      );
      const loopSequence = trim(sequence, this.loopStart, this.loopEnd, true);

      // trim can give a note that has quantizedStartStep == quantizedEndStep
      // when on border of trim region.
      loopSequence.notes = loopSequence.notes.filter(note => {
        return note.quantizedStartStep !== note.quantizedEndStep;
      });

      this.player.start(loopSequence);
      this.isPlaying = true;
    }
  }

  loop() {
    editor.clearPlayingNotes();
    this.start();
  }

  stop() {
    this.player.stop();
    this.isPlaying = false;
    editor.clearPlayingNotes();
  }
}

export default new Player();
