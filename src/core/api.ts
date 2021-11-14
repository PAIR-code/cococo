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

import { FirebaseApp, initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

import { LogEvent } from './logging';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DATA_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

class APIManager {
  app: FirebaseApp;
  isFirebaseInitialized = false;

  constructor() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.isFirebaseInitialized = true;
    } catch (err) {
      console.log('Firebase not initialized with config:', firebaseConfig);
    }
  }

  writeLogEvent(sessionId: string, logEvent: LogEvent) {
    if (!this.isFirebaseInitialized) {
      return;
    }

    const db = getDatabase();
    set(ref(db, `logs/${sessionId}/${logEvent.timestamp}`),
        logEvent);
  }
}

export default new APIManager();
