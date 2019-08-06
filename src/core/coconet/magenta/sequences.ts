/**
 * A library for common manipulations of `NoteSequence`s.
 *
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { INoteSequence } from '@magenta/music';

/**
 * Exception for when a sequence was unexpectedly quantized or unquantized.
 *
 * Should not happen during normal operation and likely indicates a programming
 * error.
 */
export class QuantizationStatusException extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Returns whether the given NoteSequence has been quantized relative to tempo.
 */
export function isRelativeQuantizedSequence(ns: INoteSequence) {
  return ns.quantizationInfo && ns.quantizationInfo.stepsPerQuarter > 0;
}

/**
 * Confirms that the given NoteSequence has been quantized relative to tempo.
 */
export function assertIsRelativeQuantizedSequence(ns: INoteSequence) {
  if (!isRelativeQuantizedSequence(ns)) {
    throw new QuantizationStatusException(
      `NoteSequence ${
        ns.id
      } is not quantized or is quantized based on absolute timing`
    );
  }
}
