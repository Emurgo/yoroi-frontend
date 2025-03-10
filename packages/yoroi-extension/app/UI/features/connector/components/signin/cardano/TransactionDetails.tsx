import type { DisplayAmount, TokenRow } from '../../../types/cardano';
import type { SelectedExplorer } from '../../../../../../domain/SelectedExplorer';
import React from 'react';
import { Box, Typography, Stack, styled, IconButton, Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import ExplorableHashContainer from '../../../../../../containers/widgets/ExplorableHashContainer';
import { truncateToken } from '../../../../../../utils/formatters';
import { useAddressHandling } from '../../../hooks/useAddressHandling';
import { Icon } from '../../../../../components/icons';


const DetailRow = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
});

const Label = styled(Typography)({
  color: 'var(--yoroi-palette-gray-600)',
});

const Value = styled(Typography)({
  color: 'var(--yoroi-palette-gray-900)',
  textAlign: 'right',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const AddressActions = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

interface TransactionDetailsProps {
  amount: DisplayAmount;
  tokenInfo: TokenRow;
  selectedExplorer: SelectedExplorer;
  address?: string;
  fee?: string;
  shouldHideBalance?: boolean;
  onCopyAddressTooltip: (address: string, message: string) => void;
  addressToDisplayString: (address: string) => string;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  amount,
  tokenInfo,
  selectedExplorer,
  address,
  fee,
  shouldHideBalance = false,
  onCopyAddressTooltip,
  addressToDisplayString,
}) => {
  const { formatAddress, handleCopyAddress } = useAddressHandling({
    onCopyAddressTooltip,
    addressToDisplayString,
  });

  const getFingerprint = (tokenInfo: TokenRow): string | undefined => {
    if (tokenInfo.Metadata.type === 'Cardano') {
      return tokenInfo.Metadata.fingerprint;
    }
    return undefined;
  };

  const renderTokenName = (tokenInfo: TokenRow) => {
    const fingerprint = getFingerprint(tokenInfo);
    return fingerprint ? (
      <ExplorableHashContainer
        selectedExplorer={selectedExplorer}
        hash={fingerprint}
        light
        linkType="token"
      >
        <span>{truncateToken(tokenInfo.Metadata.name)}</span>
      </ExplorableHashContainer>
    ) : (
      truncateToken(tokenInfo.Metadata.name)
    );
  };

  const renderAddress = (address: string) => (
    <AddressActions>
      <ExplorableHashContainer
        selectedExplorer={selectedExplorer}
        hash={address}
        light
        linkType="address"
      >
        <span>{formatAddress(address)}</span>
        <Icon.ExternalLink />
      </ExplorableHashContainer>
      <Tooltip title={<FormattedMessage id="global.copy" />}>
        <IconButton
          size="small"
          onClick={() => handleCopyAddress(address)}
          aria-label="copy address"
        >
          <Icon.Copy />
        </IconButton>
      </Tooltip>
    </AddressActions>
  );

  const renderAmount = (amountValue: string | DisplayAmount, showFiat = true) => {
    const isDisplayAmount = typeof amountValue !== 'string';
    const displayValue = isDisplayAmount ? amountValue.amount : amountValue;

    return (
      <>
        {shouldHideBalance ? '****' : displayValue} {renderTokenName(tokenInfo)}
        {showFiat && isDisplayAmount && amountValue.fiatAmount && !shouldHideBalance && (
          <Typography variant="caption" display="block" color="textSecondary">
            {amountValue.fiatAmount} {amountValue.currency}
          </Typography>
        )}
      </>
    );
  };

  return (
    <Box>
      <DetailRow>
        <Label>
          <FormattedMessage id="connector.signin.amount" />
        </Label>
        <Value>
          {renderAmount(amount)}
        </Value>
      </DetailRow>

      {fee && (
        <DetailRow>
          <Label>
            <FormattedMessage id="connector.signin.fee" />
          </Label>
          <Value>{renderAmount(fee, false)}</Value>
        </DetailRow>
      )}

      {address && (
        <DetailRow>
          <Label>
            <FormattedMessage id="connector.signin.address" />
          </Label>
          <Value>{renderAddress(address)}</Value>
        </DetailRow>
      )}

      <DetailRow>
        <Label>
          <FormattedMessage id="connector.signin.total" />
        </Label>
        <Value>
          {renderAmount(amount.total)}
        </Value>
      </DetailRow>
    </Box>
  );
};

export default TransactionDetails; 