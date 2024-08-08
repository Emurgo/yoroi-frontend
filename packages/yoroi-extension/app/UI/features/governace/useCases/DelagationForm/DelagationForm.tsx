import { LoadingButton } from '@mui/lab';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { genFormatTokenAmount, genLookupOrFail } from '../../../../../stores/stateless/tokenHelpers';
import { Collapsible } from '../../../../components/Collapsible/Collapsible';
import { PasswordInput } from '../../../../components/Input/PasswordInput';
import { DREP_ALWAYS_ABSTAIN, DREP_ALWAYS_NO_CONFIDENCE } from '../../common/constants';
import { useNavigateTo } from '../../common/useNavigateTo';
import { useStrings } from '../../common/useStrings';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { mapStatus } from '../SelectGovernanceStatus/GovernanceStatusSelection';

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
  const [txFee, setTxFee] = React.useState<string>('');
  const [isIncorectPasswaord, setIsIncorectPassword] = React.useState(false);
  const navigateTo = useNavigateTo();
  const {
    governanceVote,
    checkUserPassword,
    selectedWallet,
    signDelegationTransaction,
    txDelegationResult,
    tokenInfo,
    getFormattedPairingAmount,
    isHardwareWallet,
  } = useGovernance();

  React.useEffect(() => {
    if (txDelegationResult != null) {
      // @ts-ignore
      const rawFee = txDelegationResult.signTxRequest.fee();
      const getTokenInfo = genLookupOrFail(tokenInfo);
      const formatValue = genFormatTokenAmount(getTokenInfo);
      setTxFee(formatValue(rawFee.getDefaultEntry()));
    }
  }, [txDelegationResult]);

  const strings = useStrings();
  const confirmDelegation = async () => {
    const response = await checkUserPassword(password);
    if (response?.name === 'WrongPassphraseError') {
      setIsIncorectPassword(true);
    } else {
      try {
        setFormLoading(true);
        await signDelegationTransaction({
          password,
          publicDeriver: selectedWallet,
          dialog: null,
        });
        setFormLoading(false);
        navigateTo.transactionSubmited();
        setPassword('');
      } catch (error) {
        console.warn('[createDrepDelegationTransaction,signDelegationTransaction]', error);
        setFormLoading(false);
        navigateTo.transactionFail();
      }
    }
  };

  const mapStatusDescription = {
    delegate: strings.designatedSomeone,
    ALWAYS_ABSTAIN: 'You are choosing not to cast a vote on all proposals now and in the future.',
    ALWAYS_NO_CONFIDENCE: 'You are expressing a lack of trust for all proposals now and in the future.',
  };

  React.useEffect(() => {
    setIsIncorectPassword(false);
  }, [password]);

  return (
    <Container>
      <Stack>
        <Typography variant="body2" color="ds.gray_c600" mb="4px">
          {mapStatus[governanceVote.kind || '']}
        </Typography>
        <Typography variant="body1" mb="24px">
          {mapStatusDescription[governanceVote.kind || '']}
        </Typography>
        <TotalBox>
          <Typography variant="h4" color="ds.gray_cmin">
            {strings.total}
          </Typography>
          <Box textAlign="right">
            <Typography variant="h4" fontWeight="500" color="ds.gray_cmin">
              {txFee} ADA
            </Typography>
            <Typography variant="body2" color="ds.gray_c300">
              {String(getFormattedPairingAmount(String(Number(txFee) * 1000000)))}
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
                  <OperationInfo label={`Delegate voting to ${governanceVote.drepID}`} fee={txFee} />
                )}
                {governanceVote.kind === DREP_ALWAYS_ABSTAIN && <OperationInfo label={strings.selectAbstein} fee={txFee} />}
                {governanceVote.kind === DREP_ALWAYS_NO_CONFIDENCE && (
                  <OperationInfo label={strings.selectNoConfidence} fee={txFee} />
                )}
              </TransactionDetails>
            }
          />
        </Box>
        {isHardwareWallet ? (
          <> </>
        ) : (
          <PasswordInput
            label={strings.password}
            id="outlined-adornment-password"
            onChange={event => setPassword(event.target.value)}
            value={password}
            error={!!isIncorectPasswaord}
            helperText={isIncorectPasswaord ? strings.wrongPassword : ' '}
            disabled={formLoading}
          />
        )}
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

type OperationInfoProps = {
  label: string;
  fee: string;
};

const OperationInfo = ({ label, fee }: OperationInfoProps) => {
  return (
    <>
      <Typography variant="body1" color="ds.text_gray_normal">
        {label}
      </Typography>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body1" fontWeight="500">
          Transaction fee
        </Typography>
        <Typography variant="body1" color="ds.text_gray_normal">
          {fee} ADA
        </Typography>
      </Stack>
    </>
  );
};
