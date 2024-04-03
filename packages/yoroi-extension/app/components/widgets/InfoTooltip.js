// @flow

import React from 'react';
import { Box, Typography } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { ReactComponent as Info } from '../../assets/images/revamp/icons/info.inline.svg';

const STooltip = styled(({ className, width, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme, width }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.grayscale[900],
    opacity: 0.8,
    lineHeight: 22,
    fontSize: 14,
    maxWidth: width,
  },
}));

type Props = {|
  +content: string | React$Node,
  width?: number,
|};

export const InfoTooltip = ({ content, width }: Props): React$Node => {
  return (
    <STooltip title={content} placement="top" arrow width={width}>
      <Box component="span" color="grayscale.900">
        <Info />
      </Box>
    </STooltip>
  );
};
