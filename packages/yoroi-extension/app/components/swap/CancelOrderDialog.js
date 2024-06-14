//@flow
import { Box, Button, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog';
import AssetPair from '../common/assets/AssetPair';
import TextField from '../common/TextField';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import LoadingSpinner from '../widgets/LoadingSpinner';
import { useState } from 'react';
import type { FormattedTokenValue } from '../../containers/swap/orders/OrdersPage';
import { WrongPassphraseError } from '../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { stringifyError } from '../../utils/logging';
import { InfoTooltip } from '../widgets/InfoTooltip';
import AddCollateralPage from '../../connector/components/signin/AddCollateralPage';
import type { CardanoConnectorSignRequest, SignSubmissionErrorType } from '../../connector/types';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type LocalizableError from '../../i18n/LocalizableError';

type Props = {|
  order: any,
  reorgTxData: ?CardanoConnectorSignRequest,
  isSubmitting: boolean,
  transactionParams: ?{|
    formattedFee: string,
    returnValues: Array<FormattedTokenValue>,
  |},
  onReorgConfirm: (order: any, password: string) => Promise<void>,
  onCancelOrder: (order: any, password: string) => Promise<void>,
  onDialogClose: void => void,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => ?$ReadOnly<TokenRow>,
  selectedExplorer: SelectedExplorer,
  submissionError: ?SignSubmissionErrorType,
  walletType: 'ledger' | 'trezor' | 'web',
  hwWalletError: ?LocalizableError,
|};

export default function CancelSwapOrderDialog({
  order,
  reorgTxData,
  isSubmitting,
  transactionParams,
  onReorgConfirm,
  onCancelOrder,
  onDialogClose,
  defaultTokenInfo,
  getTokenInfo,
  selectedExplorer,
  submissionError,
  walletType,
  hwWalletError,
}: Props): React$Node {
  const [password, setPassword] = useState('');
  const [isIncorrectPassword, setIncorrectPassword] = useState(false);
  const isLoading = transactionParams == null || isSubmitting;
  if (reorgTxData != null) {
    return (
      <Dialog title="Cancel order" onClose={onDialogClose} withCloseButton closeOnOverlayClick>
        <AddCollateralPage
          txData={reorgTxData}
          onCancel={onDialogClose}
          onConfirm={s => onReorgConfirm(order, s)}
          getTokenInfo={getTokenInfo}
          selectedExplorer={selectedExplorer}
          submissionError={submissionError}
          walletType={walletType}
          hwWalletError={hwWalletError}
        />
      </Dialog>
    );
  }
  return (
    <Dialog
      title="Cancel order"
      onClose={onDialogClose}
      withCloseButton
      closeOnOverlayClick
      styleOverride={{ maxWidth: '612px', height: '496px', minWidth: '612px' }}
    >
      <Box display="flex" flexDirection="column" gap="12px">
        <Box>
          <Typography component="div" variant="body1">
            Are you sure you want to cancel this order?
          </Typography>
        </Box>
        <AssetPair
          from={order.from.token}
          to={order.to.token}
          defaultTokenInfo={defaultTokenInfo}
        />
        <Box display="flex" flexDirection="column" gap="8px">
          <SummaryRow col1="Asset price">
            {order.price} {order.from.token.ticker}
          </SummaryRow>
          <SummaryRow col1="Asset amount">
            {order.amount} {order.to.token.ticker}
          </SummaryRow>
          <SummaryRow
            col1="Total returned"
            info="The amount returned to your wallet after cancelling the order"
          >
            {transactionParams ? (
              transactionParams.returnValues.map((v, index) => (
                <>
                  {index > 0 && ' +'} {v.formattedValue} {v.ticker}
                </>
              ))
            ) : (
              <LoadingSpinner small />
            )}
          </SummaryRow>
          <SummaryRow col1="Cancellation fee">
            {transactionParams ? transactionParams.formattedFee : <LoadingSpinner small />}
          </SummaryRow>
        </Box>
        <Box>
          <TextField
            className="walletPassword"
            value={password}
            label="Password"
            type="password"
            onChange={e => {
              setIncorrectPassword(false);
              setPassword(e.target.value);
            }}
            error={isIncorrectPassword && 'Incorrect password!'}
            disabled={isLoading}
          />
        </Box>
      </Box>
      <Box display="flex" gap="24px">
        <Button fullWidth variant="secondary" onClick={onDialogClose}>
          Back
        </Button>
        <Button
          fullWidth
          variant="destructive"
          onClick={async () => {
            try {
              await onCancelOrder(order, password);
            } catch (e) {
              if (e instanceof WrongPassphraseError) {
                setIncorrectPassword(true);
                return;
              }
              console.error('Failed to process order cancel! ', e);
              alert('Failed to process order cancel! ' + stringifyError(e));
            }
          }}
          disabled={isLoading || password.length === 0}
        >
          {isLoading ? <LoadingSpinner small light /> : 'Cancel order'}
        </Button>
      </Box>
    </Dialog>
  );
}

const SummaryRow = ({ col1, children, info = '' }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center">
      <Typography component="div" variant="body1" color="grayscale.500">
        {col1}
      </Typography>
      {info ? (
        <Box ml="8px">
          <InfoTooltip content={info} />
        </Box>
      ) : null}
    </Box>
    <Box>
      <Typography component="div" variant="body1">
        {children}
      </Typography>
    </Box>
  </Box>
);
