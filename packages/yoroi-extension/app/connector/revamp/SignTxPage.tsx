import type { ConnectorStoresProps } from '../stores';
import React, { useCallback } from 'react';
import { observer } from 'mobx-react';
import { Box, Typography } from '@mui/material';
import { Layout } from '../../UI/features/connector/components/layout';
import { CardanoSignTxPage } from '../../UI/features/connector/components/signin/CardanoSignTxPage';
import { genLookupOrNull } from '../../stores/stateless/tokenHelpers';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import { WrongPassphraseError } from '../../api/ada/lib/cardanoCrypto/cryptoErrors';
import ErrorBlock from '../../components/widgets/ErrorBlock';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import globalMessages from '../../i18n/global-messages';
import config from '../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import BigNumber from 'bignumber.js';

type Props = {
  stores: ConnectorStoresProps['stores'];
};

export const SignTxPage: React.FC<Props> = observer(({ stores }) => {
  const { connector, profile, tokenInfoStore, explorers, coinPriceStore } = stores;
  const intl = useIntl();
  
  const { 
    adaTransaction, 
    signingMessage, 
    submissionError,
    hwWalletError,
    isHwWalletErrorRecoverable,
    connectedWallet,
    confirmSignInTx,
    cancelSignInTx
  } = connector;

  const form = new ReactToolboxMobxForm({
    fields: {
      walletPassword: {
        type: 'password',
        label: intl.formatMessage(globalMessages.passwordLabel),
        placeholder: intl.formatMessage(globalMessages.passwordLabel),
        value: '',
        validators: [
          ({ field }) => {
            if (!field.value) {
              return [false, intl.formatMessage(globalMessages.fieldIsRequired)];
            }
            return [true];
          },
        ],
      },
    },
    options: {
      validateOnChange: true,
      validateOnBlur: false,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf(),
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!connectedWallet) return;

    if (connectedWallet.type === 'mnemonic') {
      form.submit({
        onSuccess: async (form) => {
          const { walletPassword } = form.values();
          try {
            await confirmSignInTx(walletPassword);
          } catch (error) {
            if (error instanceof WrongPassphraseError) {
              form.$('walletPassword').invalidate(
                intl.formatMessage(globalMessages.incorrectWalletPasswordError)
              );
            } else {
              throw error;
            }
          }
        },
        onError: () => {},
      });
    } else {
      await confirmSignInTx('');
    }
  }, [connectedWallet, confirmSignInTx, form, intl]);

  if (!connectedWallet || !signingMessage) {
    return (
      <Layout>
        <Box p={3}>
          <Typography variant="h5">
            {intl.formatMessage(globalMessages.noTransactionToSign)}
          </Typography>
        </Box>
      </Layout>
    );
  }

  const selectedExplorer = explorers.selectedExplorer?.get?.(connectedWallet.networkId);
  if (!selectedExplorer) {
    throw new Error(`No explorer found for network ${connectedWallet.networkId}`);
  }

  if (submissionError) {
    return (
      <Box p={3}>
        <ErrorBlock error={submissionError.message || 'Transaction submission failed'} />
      </Box>
    );
  }

  if (hwWalletError && !isHwWalletErrorRecoverable) {
    return (
      <Box p={3}>
        <ErrorBlock error={hwWalletError} />
        {signingMessage?.sign?.type === 'tx/cardano' && signingMessage.sign.tx?.tx && (
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              {intl.formatMessage(globalMessages.transaction)}:
            </Typography>
            <textarea 
              rows={10} 
              style={{ width: '100%', fontFamily: 'monospace' }} 
              readOnly 
              value={signingMessage.sign.tx.tx} 
            />
          </Box>
        )}
      </Box>
    );
  }

  const signData = signingMessage?.sign?.type === 'data' 
    ? {
        address: signingMessage.sign.address,
        payload: signingMessage.sign.payload
      }
    : null;

  const txData = signingMessage?.sign?.type === 'tx/cardano' 
    ? signingMessage.sign.tx?.tx 
    : undefined;

  const defaultToken = {
    networkId: connectedWallet.networkId,
    identifier: connectedWallet.defaultTokenId || '',
    isDefault: true,
    amount: new BigNumber(0)
  };

  const handleCopyAddress = useCallback((address: string) => {
    try {
      navigator.clipboard.writeText(address);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }, []);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CardanoSignTxPage
        shouldHideBalance={profile.shouldHideBalance}
        connectedWebsite={connector.whiteList?.[0]}
        selectedWallet={connectedWallet}
        onCopyAddressTooltip={handleCopyAddress}
        notification={null}
        txData={adaTransaction}
        getTokenInfo={genLookupOrNull(tokenInfoStore?.tokenInfo)}
        defaultToken={defaultToken}
        network={getNetworkById(connectedWallet.networkId)}
        onConfirm={handleSubmit}
        onCancel={cancelSignInTx}
        addressToDisplayString={addressToDisplayString}
        getCurrentPrice={coinPriceStore.getCurrentPrice}
        selectedExplorer={selectedExplorer}
        unitOfAccountSetting={profile.unitOfAccount}
        submissionError={submissionError}
        signData={signData}
        walletType={connectedWallet.type}
        hwWalletError={hwWalletError}
        isHwWalletErrorRecoverable={isHwWalletErrorRecoverable}
      />
    </Box>
  );
}); 