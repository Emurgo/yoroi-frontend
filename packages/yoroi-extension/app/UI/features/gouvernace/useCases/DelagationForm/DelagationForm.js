// @flow
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Node } from 'react';
import { Button } from '@mui/material';
import { useNavigateTo } from '../../common/useNavigateTo';
import { PasswordInput } from '../../../../components';

const Container = styled(Box)(({ theme }) => ({
  paddingTop: '32px',
  maxWidth: '506px',
  margin: '0 auto',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const TotalBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  background: theme.palette.ds.bg_gradient_3,
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
}));

const TransactionDetails = styled(Stack)(({ theme }) => ({
  marginBottom: '34px',
  gap: '16px',
}));
const Actions = styled(Stack)(({ theme }) => ({
  marginBottom: '24px',
  '& .MuiButton-root': {
    width: '128px',
  },
}));

export const DelagationForm = (): Node => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwaord, setPassword] = React.useState('');
  const navigateTo = useNavigateTo();

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  return (
    <Container>
      <Stack>
        <Typography variant="body2" color="ds.gray_c600" mb="4px">
          Delegate to a DRep
        </Typography>
        <Typography variant="body1" mb="24px">
          You are designating someone else to cast your vote on your behalf for all proposals now
          and in the future.
        </Typography>
        <TotalBox>
          <Typography variant="h4" color="ds.gray_cmin">
            Total
          </Typography>
          <Box textAlign="right">
            <Typography variant="h4" fontWeight="500" color="ds.gray_cmin">
              0.5 ADA
            </Typography>
            <Typography variant="body2" color="ds.gray_c300">
              0.15 USD
            </Typography>
          </Box>
        </TotalBox>
        <Typography variant="body2" color="ds.gray_c600" mb="24px">
          Transaction Details
        </Typography>
        <TransactionDetails>
          <Typography variant="body1" fontWeight="500">
            Operations
          </Typography>
          <Typography variant="body2">
            Delegate voting to drep1e93a2zvs3aw8e4naez0ynpmc48jbc7yaa3n2k8ljhwfdt70yscts
          </Typography>
          <Typography variant="body1" fontWeight="500">
            Transaction fee: 0.5 ADA
          </Typography>
        </TransactionDetails>
        <PasswordInput
          label="Password"
          id="outlined-adornment-password"
          onChange={event => setPassword(event.target.value)}
          value={passwaord}
        />
      </Stack>
      <Actions direction="row" spacing="24px">
        <Button variant="secondary" onClick={() => navigateTo.selectStatus()}>
          Back
        </Button>
        <Button variant="primary" disabled={passwaord.length === 0}>
          Confirm
        </Button>
      </Actions>
    </Container>
  );
};
