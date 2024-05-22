// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, } from 'react-intl';
import classnames from 'classnames';
import { ReactComponent as VerifyIcon }  from '../../assets/images/verify-icon.inline.svg';
import { ReactComponent as GenerateURIIcon }  from '../../assets/images/generate-uri.inline.svg';
import styles from './WalletReceive.scss';
import CopyableAddress from '../widgets/CopyableAddress';
import RawHash from '../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { AddressFilterKind, StandardAddress } from '../../types/AddressFilterTypes';
import { addressFilter, AddressFilter, } from '../../types/AddressFilterTypes';
import environment from '../../environment';
import type { Notification } from '../../types/notification.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { truncateAddressShort, splitAmount, truncateToken } from '../../utils/formatters';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { ReactComponent as NoTransactionModernSvg }  from '../../assets/images/transaction/no-transactions-yet.modern.inline.svg';
import { ReactComponent as AddLabelIcon }  from '../../assets/images/add-label.inline.svg';
import { ReactComponent as EditLabelIcon }  from '../../assets/images/edit.inline.svg';
import { hiddenAmount } from '../../utils/strings';
import type {
  TokenEntry, TokenLookupKey,
} from '../../api/common/lib/MultiToken';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';

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
    id: 'wallet.receive.page.outputAmountUTXO',
    defaultMessage: '!!!Balance (UTXO sum)',
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
  +onVerifyAddress: $ReadOnly<StandardAddress> => Promise<void>,
  +onGeneratePaymentURI: void | (string => void),
  +shouldHideBalance: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +addressBook: boolean,
|};

@observer
export default class WalletReceive extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  getAmount: TokenEntry => ?Node = tokenEntry => {
    if (this.props.shouldHideBalance) {
      return (<span>{hiddenAmount}</span>);
    }
    const tokenInfo = this.props.getTokenInfo(tokenEntry);

    const shiftedAmount = tokenEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount,
      tokenInfo.Metadata.numberOfDecimals
    );
    // recall: can't be negative in this situation
    const adjustedBefore = '+' + beforeDecimalRewards;

    return (
      <>
        {adjustedBefore}
        <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        {' '}
        {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  }

  getValueBlock: void => {|
    header: ?Node,
    body: $ReadOnly<StandardAddress> => ?Node,
  |} = () => {
    if (this.props.addressBook) {
      return { header: undefined, body: () => undefined };
    }
    const { intl } = this.context;

    const header = (<h2>{intl.formatMessage(messages.outputAmountUTXO)}</h2>);
    const body = address => (
      <div>
        {address.values != null
          ? (
            <div className={styles.walletAmount}>
              {this.getAmount(address.values.getDefaultEntry())}
            </div>
          )
          : '-'
        }
      </div>
    );
    return { header, body };
  }

  getLabelBlock: void => {|
    header: ?Node,
    body: $ReadOnly<StandardAddress> => ?Node,
  |} = () => {
    if (environment.isProduction()) {
      return { header: undefined, body: () => undefined };
    }
    const { intl } = this.context;

    const header = (<h2 className={styles.labelHeader}>{intl.formatMessage(messages.label)}</h2>);
    const body = address => (
      <div>
        {
          address.label != null ?
            <div className={styles.labelAddress}>
              <button type="button" onClick={() => { /* On Edit */ }}>
                <span className={styles.labelAddressIcon}>
                  <EditLabelIcon />
                </span>
              </button>
              <span className={styles.labelText}> {address.label} </span>
            </div>
            :
            <div className={styles.labelAddress}>
              <button type="button" onClick={() => { /* On Add Label */ }}>
                <span className={styles.labelAddressIcon}>
                  <AddLabelIcon />
                </span>
              </button>
            </div>
        }
      </div>
    );
    return { header, body };
  }

  getHierarchy: void => Node = () => {
    const { intl } = this.context;
    const hierarchy = this.props.hierarchy.path.join(' > ');

    const filter = this.props.hierarchy.filter === AddressFilter.None
      ? null
      : (
        <span className={styles.filter}>
          [{intl.formatMessage(addressFilter[this.props.hierarchy.filter])}]
        </span>
      );
    return (
      <div className={styles.hierarchy}>
        {hierarchy} {filter}
      </div>
    );
  };

  render(): Node {
    const {
      walletAddresses,
      onVerifyAddress, onGeneratePaymentURI,
      onCopyAddressTooltip, notification,
    } = this.props;
    const { intl } = this.context;
    const valueBlock = this.getValueBlock();
    const labelBlock = this.getLabelBlock();
    const walletReceiveContent = (
      <div className={styles.generatedAddresses}>
        {/* Header Addresses */}
        <div className={styles.generatedAddressesGrid}>
          <h2>{intl.formatMessage(messages.generatedAddressesSectionTitle)}</h2>
          {labelBlock.header}
          {valueBlock.header}
          {onGeneratePaymentURI != null && (
            <h2>{intl.formatMessage(messages.generateURLLabel)}</h2>
          )}
          <h2>{intl.formatMessage(messages.verifyAddressLabel)}</h2>
        </div>

        {/* Content Addresses */}
        {walletAddresses.map((address, index) => {
          const addressClasses = classnames([
            'generatedAddress-' + (index + 1),
            styles.walletAddress,
            styles.generatedAddressesGrid,
            address.isUsed === true ? styles.usedWalletAddress : null,
          ]);
          const notificationElementId = `address-${index}-copyNotification`;
          return (
            <div key={`gen-${address.address}`} className={addressClasses}>
              {/* Address Id */}
              <CopyableAddress
                id='walletReceive'
                hash={address.address}
                elementId={notificationElementId}
                onCopyAddress={
                  () => onCopyAddressTooltip(address.address, notificationElementId)
                }
                notification={notification}
                placementTooltip="bottom-start"
              >
                <ExplorableHashContainer
                  selectedExplorer={this.props.selectedExplorer}
                  hash={address.address}
                  light={address.isUsed === true}
                  linkType={address.type === CoreAddressTypes.CARDANO_REWARD
                    ? 'stakeAddress'
                    : 'address'
                  }
                >
                  <RawHash light={address.isUsed === true}>
                    <span
                      className={classnames([
                        styles.addressHash,
                        address.isUsed === true && styles.addressHashUsed
                      ])}
                    >
                      {truncateAddressShort(address.address)}
                    </span>
                  </RawHash>
                </ExplorableHashContainer>
              </CopyableAddress>
              {/* Label for Address Book */}
              {labelBlock.body(address)}
              {/* Address balance block start */}
              {valueBlock.body(address)}
              {/* Generate payment URL for Address action */}
              {onGeneratePaymentURI != null && (
                <div className={classnames([
                  styles.addressActionItemBlock,
                  styles.generateURLActionBlock])}
                >
                  <button
                    type="button"
                    onClick={onGeneratePaymentURI.bind(this, address.address)}
                    className={styles.btnGenerateURI}
                  >
                    <div className={styles.generateURLActionBlock}>
                      <span className={styles.generateURIIcon}>
                        <GenerateURIIcon />
                      </span>
                    </div>
                  </button>
                </div>
              )}
              {/* Verify Address action */}
              <div className={classnames([
                styles.addressActionItemBlock,
                styles.verifyActionBlock])}
              >
                <button
                  type="button"
                  onClick={
                    onVerifyAddress.bind(this, address)
                  }
                >
                  <div>
                    <span className={styles.verifyIcon}>
                      <VerifyIcon />
                    </span>
                  </div>
                </button>
              </div>
              {/* Action block end */}
            </div>
          );
        })}
      </div>
    );

    if (walletAddresses === undefined || walletAddresses.length === 0) {
      return (
        <div className={styles.component}>
          {this.getHierarchy()}
          {this.props.header}
          <div className={styles.notFound}>
            <NoTransactionModernSvg />
            <h1>{intl.formatMessage(messages.noResultsFoundLabel)}</h1>
            <div>{intl.formatMessage(messages.notFoundAnyAddresses)}</div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.component}>
        {this.getHierarchy()}
        {this.props.header}
        {walletReceiveContent}
      </div>
    );
  }
}
