import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { FormattedMessage } from 'react-intl';
import { SignTxTabs } from './SignTxTabs';
import { PasswordForm, TransactionDetails, UtxoDetails } from './cardano';
import { ErrorBlock } from '../../../../../components/widgets/ErrorBlock';
import type { CardanoSignTxPageProps } from '../../types/cardano';
import { useFiatConversion } from '../../hooks/useFiatConversion';
import BigNumber from 'bignumber.js';

export const CardanoSignTxPage: React.FC<CardanoSignTxPageProps> = observer(({
  txData,
  onCopyAddressTooltip,
  onCancel,
  onConfirm,
  notification,
  getTokenInfo,
  defaultToken,
  network,
  unitOfAccountSetting,
  addressToDisplayString,
  selectedExplorer,
  getCurrentPrice,
  shouldHideBalance,
  selectedWallet,
  connectedWebsite,
  submissionError,
  signData,
  walletType,
  hwWalletError,
  isHwWalletErrorRecoverable,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (password: string) => {
    setIsSubmitting(true);
    try {
      await onConfirm(password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderConnectionContent = () => (
    <Box p={3}>
      {connectedWebsite && (
        <Typography>
          <FormattedMessage 
            id="connector.signin.connectedTo" 
            values={{ website: connectedWebsite.url }} 
          />
        </Typography>
      )}
      {selectedWallet && (
        <Typography mt={2}>
          <FormattedMessage 
            id="connector.signin.selectedWallet" 
            values={{ name: selectedWallet.name }} 
          />
        </Typography>
      )}
    </Box>
  );

  const renderDetailsContent = () => {
    if (!txData) return null;

    const tokenInfo = getTokenInfo({
      identifier: defaultToken.identifier,
      networkId: network.NetworkId
    });

    if (!tokenInfo) return null;

    const amount = new BigNumber(txData.amount || '0');
    const { fiatAmount, currency } = useFiatConversion({
      amount,
      tokenInfo,
      unitOfAccountSetting,
      getCurrentPrice,
    });

    return (
      <Box p={3}>
        <TransactionDetails
          amount={{
            amount: txData.amount || '0',
            fee: txData.fee || '0',
            total: txData.total || '0',
            fiatAmount,
            currency,
            ticker: tokenInfo.Metadata.ticker
          }}
          tokenInfo={tokenInfo}
          selectedExplorer={selectedExplorer}
          address={txData.address}
          fee={txData.fee}
          shouldHideBalance={shouldHideBalance}
          onCopyAddressTooltip={onCopyAddressTooltip}
          addressToDisplayString={addressToDisplayString}
        />
      </Box>
    );
  };

  const renderUtxosContent = () => {
    if (!txData || !txData.utxos) return null;

    const tokenInfo = getTokenInfo({
      identifier: defaultToken.identifier,
      networkId: network.NetworkId
    });

    if (!tokenInfo) return null;

    return (
      <Box p={3}>
        <UtxoDetails
          utxos={txData.utxos}
          tokenInfo={tokenInfo}
          shouldHideBalance={shouldHideBalance}
          unitOfAccountSetting={unitOfAccountSetting}
          getCurrentPrice={getCurrentPrice}
        />
      </Box>
    );
  };

  if (submissionError) {
    return (
      <Box p={3}>
        <ErrorBlock error={submissionError.message} />
      </Box>
    );
  }

  if (hwWalletError) {
    return (
      <Box p={3}>
        <ErrorBlock 
          error={hwWalletError} 
          onRetry={isHwWalletErrorRecoverable ? handleSubmit : undefined} 
        />
      </Box>
    );
  }

  if (notification) {
    return (
      <Box p={3}>
        <Typography color={notification.type === 'error' ? 'error' : 'success'}>
          {notification.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <SignTxTabs
        connectionContent={renderConnectionContent()}
        utxosContent={renderUtxosContent()}
        detailsContent={renderDetailsContent()}
        isDataSignin={Boolean(signData)}
      />
      {walletType === 'mnemonic' && (
        <Box p={3}>
          <PasswordForm
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
          />
        </Box>
      )}
    </Box>
  );
});

export default CardanoSignTxPage; 