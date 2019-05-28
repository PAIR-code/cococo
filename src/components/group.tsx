import React from 'react';

export interface GroupProps {
  x?: number;
  y?: number;
  children?: React.ReactNode;
}

export function Group(props: GroupProps) {
  const { x, y, children } = props;
  const transform = `translate(${x},${y})`;
  return <g transform={transform}>{children}</g>;
}

Group.defaultProps = {
  x: 0,
  y: 0,
};
