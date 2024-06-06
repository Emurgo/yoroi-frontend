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
import { useGovernance } from '../../module/GovernanceContextProvider';
import { useCreateAndSendDrepDelegationTransaction } from '../../api/useCreateAndSendDrepDelegationTransaction';
import { useStrings } from '../../common/useStrings';
import { Collapsible } from '../../../../components';

const Container = styled(Box)(({ theme }) => ({
  paddingTop: '23px',
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
  const { dRepId, governanceVote, walletId } = useGovernance();
  const strings = useStrings();

  const confirmDelegation = () => {
    // TODO mock functionality
    if (passwaord.includes('oo')) {
      navigateTo.transactionFail();
    } else {
      navigateTo.transactionSubmited();
      useCreateAndSendDrepDelegationTransaction({ walletId, governanceVote });
    }
  };
  const idPasswordInvalid = passwaord.match(/\d+/g);
  console.log('sssdsdsds', strings.total);
  return (
    <Container>
      <Stack>
        <Typography variant="body2" color="ds.gray_c600" mb="4px">
          {strings.delegateToDRep}
        </Typography>
        <Typography variant="body1" mb="24px">
          {strings.designatedSomeone}
        </Typography>
        <TotalBox>
          <Typography variant="h4" color="ds.gray_cmin">
            {strings.total}
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
          {strings.transactionDetails}
        </Typography>
        <Box mb="40px">
          <Collapsible
            title={strings.operations}
            content={
              <TransactionDetails>
                {governanceVote.kind === 'delegate' && (
                  <>
                    <Typography variant="body2">{`Delegate voting to ${governanceVote.drepID}`}</Typography>
                    <Typography variant="body1" fontWeight="500">
                      Transaction fee: 0.5 ADA
                    </Typography>
                  </>
                )}
                {governanceVote.kind === 'abstain' && (
                  <>
                    <Typography variant="body2">{strings.selectAbstein}</Typography>
                  </>
                )}
                {governanceVote.kind === 'no-confidence' && (
                  <>
                    <Typography variant="body2">{strings.selectNoConfidenc}</Typography>
                  </>
                )}
              </TransactionDetails>
            }
          />
        </Box>
        <PasswordInput
          label={strings.password}
          id="outlined-adornment-password"
          onChange={event => setPassword(event.target.value)}
          value={passwaord}
          error={!!idPasswordInvalid}
          helperText={idPasswordInvalid ? strings.wrongPassword : ' '}
        />
      </Stack>
      <Actions direction="row" spacing="24px">
        <Button variant="secondary" onClick={() => navigateTo.selectStatus()}>
          {strings.back}
        </Button>
        <Button variant="primary" disabled={passwaord.length === 0 || idPasswordInvalid} onClick={confirmDelegation}>
          {strings.confirm}
        </Button>
      </Actions>
    </Container>
  );
};
