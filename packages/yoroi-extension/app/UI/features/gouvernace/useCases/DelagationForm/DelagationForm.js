// @flow
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import type { Node } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Icon } from '../../../../components/icons/index';
import { VisibilityOff } from '../../../../components/icons/VisibilityOff';
import { VisibilityOn } from '../../../../components/icons/VisibilityOn';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Button } from '@mui/material';

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

        {/* // TODO to be extracted in a reusable component for all features */}
        <FormControl variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput
            fullWidth
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            onChange={event => setPassword(event.target.value)}
            value={passwaord}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <Icon.VisibilityOff /> : <Icon.VisibilityOn />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            sx={{ color: 'black' }}
          />
        </FormControl>
      </Stack>
      <Actions direction="row" spacing="24px">
        <Button variant="secondary">Back</Button>
        <Button variant="primary" disabled={passwaord.length === 0}>
          Confirm
        </Button>
      </Actions>
    </Container>
  );
};
