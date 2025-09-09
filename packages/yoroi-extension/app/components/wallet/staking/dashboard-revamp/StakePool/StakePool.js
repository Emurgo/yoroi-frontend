// @flow
import type { Node } from 'react';
import { styled, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ReactComponent as InfoIconRevamp } from '../../../../../assets/images/info-icon-revamp.inline.svg';

type HelperTooltipProps = {|
  +message: string | Node,
  +placement?: string,
|};

export const HelperTooltip = ({ message, placement }: HelperTooltipProps): Node => {
  return (
    <Tooltip
      title={
        <Typography component="div" variant="body2">
          {message}
        </Typography>
      }
      arrow
      placement={placement || 'right'}
    >
      <IconWrapper display="inline-flex">
        <InfoIconRevamp />
      </IconWrapper>
    </Tooltip>
  );
};

HelperTooltip.defaultProps = {
  placement: 'right',
};

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));
