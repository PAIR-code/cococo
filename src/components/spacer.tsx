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

import React from 'react';
import { style } from 'typestyle';

interface SpacerProps {
  width: number;
}
export function Spacer(props: SpacerProps) {
  const spacerStyle = style({
    width: props.width,
    display: 'inline-block',
  });
  return <div className={spacerStyle} />;
}
Spacer.defaultProps = { width: 5 };
