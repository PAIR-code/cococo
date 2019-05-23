import React from 'react';
import { style } from 'typestyle';

import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';

export interface WorkingProps {
  open: boolean;
  title: string;
}

export function Working(props: WorkingProps) {
  const { open, title } = props;

  const spinnerStyle = style({
    width: 200,
    height: 160,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
  });

  return (
    <Dialog open={open}>
      <div className={spinnerStyle}>
        <Typography variant="h6" color="inherit">
          🤖 Working...
        </Typography>{' '}
        <CircularProgress color="secondary" />
      </div>
    </Dialog>
  );
}
