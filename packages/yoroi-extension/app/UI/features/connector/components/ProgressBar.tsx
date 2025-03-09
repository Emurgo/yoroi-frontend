import React from 'react';
import { LinearProgress, styled } from '@mui/material';
import type { ProgressBarProps } from '../types';

const ProgressWrapper = styled('div')({
  overflow: 'hidden',
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
});

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: '8px',
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.secondary[300],
  },
  '& .MuiLinearProgress-colorSecondary': {
    backgroundColor: theme.palette.grey[200],
  },
}));

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  step = 1, 
  max = 3 
}) => {
  return (
    <ProgressWrapper>
      <StyledLinearProgress
        color="secondary"
        value={(step * 100) / max}
        variant="determinate"
      />
    </ProgressWrapper>
  );
};

export default ProgressBar; 