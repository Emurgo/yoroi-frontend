import { LoadingButton } from '@mui/lab';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Collapsible } from '../../../../components/Collapsible/Collapsible';
import { PasswordInput } from '../../../../components/Input/PasswordInput';
import { useNavigateTo } from '../../common/useNavigateTo';
import { useStrings } from '../../common/useStrings';
import { useGovernance } from '../../module/GovernanceContextProvider';

const Container = styled(Box)(() => ({
  paddingTop: '23px',
  maxWidth: '506px',
  margin: '0 auto',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const TotalBox = styled(Box)(({ theme }: any) => ({
  display: 'flex',
  justifyContent: 'space-between',
  background: theme.palette.ds.bg_gradient_3,
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
}));

const TransactionDetails = styled(Stack)(() => ({
  gap: '16px',
}));
const Actions = styled(Stack)(() => ({
  marginBottom: '24px',
  '& .MuiButton-root': {
    width: '128px',
  },
}));

export const DelagationForm = () => {
  const [password, setPassword] = React.useState('');
  const [formLoading, setFormLoading] = React.useState(false);
  const [isIncorectPasswaord, setIsIncorectPassword] = React.useState(false);
  const navigateTo = useNavigateTo();
  const {
    governanceVote,
    checkUserPassword,
    createDrepDelegationTransaction,
    txDelegationResult,
    txDelegationError,
    selectedWallet,
    signDelegationTransaction,
  } = useGovernance();

  const strings = useStrings();

  React.useEffect(() => {
    console.log('txDelegationError', txDelegationError);
    console.log('txDelegationResult', txDelegationResult);
    const signTx = async () => {
      const result = await signDelegationTransaction({
        password,
        publicDeriver: selectedWallet,
        dialog: null,
      });

      navigateTo.transactionSubmited();
      try {
      } catch (error) {
        console.log('ERROR on signDelegationTransaction', error);
        setFormLoading(false);
        navigateTo.transactionFail();
      }
    };

    if (txDelegationResult != null && password.length > 0) {
      signTx();
    }
  }, [txDelegationResult, txDelegationError]);

  const confirmDelegation = async () => {
    const response = await checkUserPassword(password);
    if (response?.name === 'WrongPassphraseError') {
      setIsIncorectPassword(true);
    } else {
      try {
        setFormLoading(true);
        await createDrepDelegationTransaction(governanceVote.kind === 'delegate' ? governanceVote.drepID : governanceVote.kind);
      } catch (error) {
        console.log('ERROR on createDrepDelegationTransaction', error);
        setFormLoading(false);
        navigateTo.transactionFail();
      }
    }
  };

  React.useEffect(() => {
    setIsIncorectPassword(false);
  }, [password]);

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
                    <Typography
                      variant="body1"
                      color="ds.text_gray_normal"
                    >{`Delegate voting to ${governanceVote.drepID}`}</Typography>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" fontWeight="500">
                        Transaction fee
                      </Typography>
                      <Typography variant="body1" color="ds.text_gray_normal">
                        0.5 ADA
                      </Typography>
                    </Stack>
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
          value={password}
          error={!!isIncorectPasswaord}
          helperText={isIncorectPasswaord ? strings.wrongPassword : ' '}
          disabled={formLoading}
        />
      </Stack>
      <Actions direction="row" spacing="24px">
        {/* @ts-ignore */}
        <Button variant="secondary" onClick={() => navigateTo.selectStatus()}>
          {strings.back}
        </Button>
        <LoadingButton
          //  @ts-ignore
          variant="primary"
          loading={formLoading}
          disabled={password.length === 0}
          onClick={async () => confirmDelegation()}
        >
          {strings.confirm}
        </LoadingButton>
      </Actions>
    </Container>
  );
};
