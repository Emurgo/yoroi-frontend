// @flow
import type { Node } from 'react';
import type { AddressFilterKind, StandardAddress } from '../../types/AddressFilterTypes';
import type { Notification } from '../../types/notification.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import type { TokenEntry, TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import { ReactComponent as VerifyIcon } from '../../assets/images/revamp/verify-icon.inline.svg';
import { ReactComponent as GenerateURIIcon } from '../../assets/images/revamp/generate-uri.inline.svg';
import styles from './WalletReceiveRevamp.scss';
import CopyableAddress from '../widgets/CopyableAddress';
import RawHash from '../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import { truncateAddressShort, splitAmount, truncateToken } from '../../utils/formatters';
import { ReactComponent as NoTransactionModernSvg } from '../../assets/images/transaction/no-transactions-yet.modern.inline.svg';
import { hiddenAmount } from '../../utils/strings';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { Box, Typography, styled } from '@mui/material';

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.text_gray_medium,
    },
  },
}));

const messages = defineMessages({
  generatedAddressesSectionTitle: {
    id: 'wallet.receive.page.generatedAddressesSectionTitle',
    defaultMessage: '!!!Generated addresses',
  },
  copyAddressLabel: {
    id: 'wallet.receive.page.copyAddressLabel',
    defaultMessage: '!!!Copy address',
  },
  verifyAddressLabel: {
    id: 'wallet.receive.page.verifyAddressLabel',
    defaultMessage: '!!!Verify address',
  },
  generateURLLabel: {
    id: 'wallet.receive.page.generateURLLabel',
    defaultMessage: '!!!Generate URL',
  },
  outputAmountUTXO: {
    id: 'wallet.revamp.receive.page.outputAmountUTXO',
    defaultMessage: '!!!Output Amount (UTXO)',
  },
  noResultsFoundLabel: {
    id: 'wallet.receive.page.noResultsFoundLabel',
    defaultMessage: '!!!No results found.',
  },
  notFoundAnyAddresses: {
    id: 'wallet.receive.page.notFoundAnyAddresses',
    defaultMessage: '!!!No wallet addresses have been used yet.',
  },
  label: {
    id: 'wallet.receive.page.label',
    defaultMessage: '!!!Label ',
  },
});

type Props = {|
  +hierarchy: {|
    path: Array<string>,
    filter: AddressFilterKind,
  |},
  +header: Node,
  +selectedExplorer: SelectedExplorer,
  +walletAddresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +onVerifyAddress: ($ReadOnly<StandardAddress>) => Promise<void>,
  +onGeneratePaymentURI: void | (string => void),
  +shouldHideBalance: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +addressBook: boolean,
|};

@observer
export default class WalletReceiveRevamp extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  locationId: string = 'wallet:receive:infoPanel:footer';

  getAmount: TokenEntry => ?Node = tokenEntry => {
    if (this.props.shouldHideBalance) {
      return <span>{hiddenAmount}</span>;
    }
    const tokenInfo = this.props.getTokenInfo(tokenEntry);

    const shiftedAmount = tokenEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);
    // recall: can't be negative in this situation
    const adjustedBefore = '+' + beforeDecimalRewards;

    return (
      <>
        {adjustedBefore}
        <span className={styles.afterDecimal}>{afterDecimalRewards}</span> {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };

  getValueBlock: void => {|
    header: ?Node,
    body: ($ReadOnly<StandardAddress>, number) => ?Node,
  |} = () => {
    if (this.props.addressBook) {
      return { header: undefined, body: () => undefined };
    }
    const { intl } = this.context;

    const header = (
      <Typography component="h2" variant="body2" color="grayscale.500" textAlign="right">
        {intl.formatMessage(messages.outputAmountUTXO)}
      </Typography>
    );
    const body = (address, rowIndex: number) => (
      <Typography
        component="div"
        variant="body1"
        color="ds.text_gray_medium"
        textAlign="right"
        id={this.locationId + ':addressRow_' + rowIndex + '-adaAmount-text'}
      >
        {address.values != null ? <span>{this.getAmount(address.values.getDefaultEntry())}</span> : '-'}
      </Typography>
    );
    return { header, body };
  };

  render(): Node {
    const { walletAddresses, onVerifyAddress, onGeneratePaymentURI, onCopyAddressTooltip, notification } = this.props;
    const { intl } = this.context;
    const valueBlock = this.getValueBlock();
    const walletReceiveContent = (
      <div className={styles.generatedAddresses}>
        {/* Header Addresses */}
        <Box
          py="13px"
          px="24px"
          borderBottom="1px solid"
          borderBottomColor="grayscale.200"
          className={styles.generatedAddressesGrid}
        >
          <Typography color="grayscale.600" component="h2" variant="body2">
            {intl.formatMessage(messages.generatedAddressesSectionTitle)}
          </Typography>
          {valueBlock.header}
          {onGeneratePaymentURI != null && (
            <Typography color="grayscale.600" component="h2" variant="body2" textAlign="right">
              {intl.formatMessage(messages.generateURLLabel)}
            </Typography>
          )}
          <Typography color="grayscale.600" component="h2" variant="body2" textAlign="right">
            {intl.formatMessage(messages.verifyAddressLabel)}
          </Typography>
        </Box>

        {/* Content Addresses */}
        {walletAddresses.map((address, index) => {
          const addressClasses = classnames([
            'generatedAddress-' + (index + 1),
            styles.walletAddress,
            styles.generatedAddressesGrid,
            address.isUsed === true ? styles.usedWalletAddress : null,
          ]);
          const notificationElementId = `address-${index}-copyNotification`;
          const rowLocationId = `${this.locationId}:addressRow_${index}`;
          return (
            <Box
              key={`gen-${address.address}`}
              sx={{ p: '13px 24px !important' }}
              className={addressClasses}
              id={this.locationId + '-addressRow_' + index + '-box'}
            >
              {/* Address Id */}
              <CopyableAddress
                id={rowLocationId}
                hash={address.address}
                elementId={notificationElementId}
                onCopyAddress={() => onCopyAddressTooltip(address.address, notificationElementId)}
                notification={notification}
                placementTooltip="bottom-start"
              >
                <ExplorableHashContainer
                  selectedExplorer={this.props.selectedExplorer}
                  hash={address.address}
                  light={address.isUsed === true}
                  linkType={address.type === CoreAddressTypes.CARDANO_REWARD ? 'stakeAddress' : 'address'}
                >
                  <RawHash light={address.isUsed === true}>
                    <Typography component="div" variant="body1" color="ds.text_gray_medium" fontWeight="400">
                      {truncateAddressShort(address.address, 16)}
                    </Typography>
                  </RawHash>
                </ExplorableHashContainer>
              </CopyableAddress>
              {/* Address balance block start */}
              {valueBlock.body(address, index)}
              {/* Generate payment URL for Address action */}
              {onGeneratePaymentURI != null && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={onGeneratePaymentURI.bind(this, address.address)}
                    className={styles.btnGenerateURI}
                    id={rowLocationId + '-generateUrl-button'}
                  >
                    <div className={styles.generateURLActionBlock}>
                      <span className={styles.generateURIIcon}>
                        <IconWrapper>
                          <GenerateURIIcon />
                        </IconWrapper>
                      </span>
                    </div>
                  </button>
                </Box>
              )}
              {/* Verify Address action */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <button type="button" onClick={onVerifyAddress.bind(this, address)} id={rowLocationId + '-verifyAddress-button'}>
                  <div>
                    <span>
                      <IconWrapper>
                        <VerifyIcon />
                      </IconWrapper>
                    </span>
                  </div>
                </button>
              </Box>
              {/* Action block end */}
            </Box>
          );
        })}
      </div>
    );

    if (walletAddresses === undefined || walletAddresses.length === 0) {
      return (
        <div className={styles.component}>
          {this.props.header}
          <div className={styles.notFound} id={this.locationId + '-noAddresses-component'}>
            <NoTransactionModernSvg />
            <h1>{intl.formatMessage(messages.noResultsFoundLabel)}</h1>
            <div>{intl.formatMessage(messages.notFoundAnyAddresses)}</div>
          </div>
        </div>
      );
    }

    return (
      <Box className={styles.component} pl="24px">
        {this.props.header}
        {walletReceiveContent}
      </Box>
    );
  }
}
