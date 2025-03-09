import React from 'react';
import { Box, Typography, Stack, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import BigNumber from 'bignumber.js';
import type { TokenRow } from '../../../types/cardano';
import { useFiatConversion } from '../../../hooks/useFiatConversion';
import type { UnitOfAccountSettingType } from '../../../../../../types/unitOfAccountType';

const UtxoContainer = styled(Box)({
  backgroundColor: 'var(--yoroi-palette-gray-50)',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
});

const DetailRow = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
});

const Label = styled(Typography)({
  color: 'var(--yoroi-palette-gray-600)',
  fontSize: '14px',
});

const Value = styled(Typography)({
  color: 'var(--yoroi-palette-gray-900)',
  fontSize: '14px',
  textAlign: 'right',
});

interface UtxoDetailsProps {
  utxos: Array<{
    amount: BigNumber;
    id: string;
    index: number;
  }>;
  tokenInfo: TokenRow;
  shouldHideBalance: boolean;
  unitOfAccountSetting: UnitOfAccountSettingType;
  getCurrentPrice: (from: string, to: string) => string | null;
}

export const UtxoDetails: React.FC<UtxoDetailsProps> = ({
  utxos,
  tokenInfo,
  shouldHideBalance,
  unitOfAccountSetting,
  getCurrentPrice,
}) => {
  const renderUtxo = (utxo: { amount: BigNumber; id: string; index: number }) => {
    const { fiatAmount, currency } = useFiatConversion({
      amount: utxo.amount,
      tokenInfo,
      unitOfAccountSetting,
      getCurrentPrice,
    });

    const formattedAmount = utxo.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals).toString();

    return (
      <UtxoContainer key={`${utxo.id}-${utxo.index}`}>
        <DetailRow>
          <Label>
            <FormattedMessage id="connector.signin.utxo.id" />
          </Label>
          <Value>{`${utxo.id}#${utxo.index}`}</Value>
        </DetailRow>
        <DetailRow>
          <Label>
            <FormattedMessage id="connector.signin.utxo.amount" />
          </Label>
          <Value>
            {shouldHideBalance ? '****' : formattedAmount} {tokenInfo.Metadata.ticker}
            {fiatAmount && !shouldHideBalance && (
              <Typography variant="caption" display="block" color="textSecondary">
                {fiatAmount} {currency}
              </Typography>
            )}
          </Value>
        </DetailRow>
      </UtxoContainer>
    );
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        <FormattedMessage 
          id="connector.signin.utxos.title" 
          values={{ count: utxos.length }}
        />
      </Typography>
      {utxos.map(renderUtxo)}
    </Box>
  );
};

export default UtxoDetails; 