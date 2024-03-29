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

export interface GroupProps {
  x?: number;
  y?: number;
  children?: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function Group(props: GroupProps) {
  const { x, y, children, ...restProps } = props;
  const transform = `translate(${x},${y})`;
  return (
    <g transform={transform} {...restProps}>
      {children}
    </g>
  );
}

Group.defaultProps = {
  x: 0,
  y: 0,
};
