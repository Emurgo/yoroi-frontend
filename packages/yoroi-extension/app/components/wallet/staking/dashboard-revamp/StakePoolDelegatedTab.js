// @flow
import type { Node } from 'react';
import { Box, styled } from '@mui/system';
import DelegatedStakePoolCard from './DelegatedStakePoolCard';
import InfoIconSVG from '../../../../assets/images/info-icon.inline.svg';
import { IconButton, Typography } from '@mui/material';
import CloseIcon from '../../../../assets/images/forms/close.inline.svg';
import type { PoolData } from '../../../../containers/wallet/staking/SeizaFetcher';

type Props = {|
  alertMessage: string,
  delegatedPool: PoolData,
  undelegate: void | (void => Promise<void>),
|};

export function StakePoolDelegatedTab({ alertMessage, delegatedPool, undelegate }: Props): Node {
  return (
    <Box>
      <StakePoolAlert message={alertMessage} />
      <Box py="10px" borderBottom="1px solid var(--yoroi-palette-gray-200)">
        <DelegatedStakePoolCard delegatedPool={delegatedPool} undelegate={undelegate} />
      </Box>
    </Box>
  );
}

function StakePoolAlert({ message }: {| message: string |}): Node {
  return (
    <StyledBox>
      <InfoIconSVG />
      <Typography component="div" variant="body2" color="var(--yoroi-palette-gray-600)" marginLeft="8px">
        {message}
      </Typography>
      <IconButton>
        <CloseIcon />
      </IconButton>
    </StyledBox>
  );
}

const StyledBox = styled(Box)({
  display: 'flex',
  background: 'var(--yoroi-palette-gray-50)',
  padding: '12px 16px',
  alignItems: 'center',
  marginBottom: '6px',
  borderRadius: '8px',
  '& > svg:first-of-type': {
    minWidth: '24px',
  },
});
