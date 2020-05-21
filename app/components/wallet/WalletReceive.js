// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, } from 'react-intl';
import classnames from 'classnames';
import VerifyIcon from '../../assets/images/verify-icon.inline.svg';
import GenerateURIIcon from '../../assets/images/generate-uri.inline.svg';
import styles from './WalletReceive.scss';
import CopyableAddress from '../widgets/CopyableAddress';
import RawHash from '../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import type { ExplorerType } from '../../domain/Explorer';
import type { StandardAddress } from '../../stores/base/AddressesStore';
import environment from '../../environment';
import type { Notification } from '../../types/notificationType';
import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  generatedAddressesSectionTitle: {
    id: 'wallet.receive.page.generatedAddressesSectionTitle',
    defaultMessage: '!!!Generated addresses',
  },
  hideUsedLabel: {
    id: 'wallet.receive.page.hideUsedLabel',
    defaultMessage: '!!!hide used',
  },
  showUsedLabel: {
    id: 'wallet.receive.page.showUsedLabel',
    defaultMessage: '!!!show used',
  },
  copyAddressLabel: {
    id: 'wallet.receive.page.copyAddressLabel',
    defaultMessage: '!!!Copy address',
  },
  verifyAddressLabel: {
    id: 'wallet.receive.page.verifyAddressLabel',
    defaultMessage: '!!!Verify address',
  },
  generatePaymentURLLabel: {
    id: 'wallet.receive.page.generatePaymentURLLabel',
    defaultMessage: '!!!Generate payment URL',
  },
});

type Props = {|
  +header: Node,
  +selectedExplorer: ExplorerType,
  +walletAddresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +onVerifyAddress: {| address: string, path: void | BIP32Path |} => Promise<void>,
  +onGeneratePaymentURI: void | (string => void),
|};

type State = {|
  showUsed: boolean,
|};

@observer
export default class WalletReceive extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    showUsed: true,
  };

  toggleUsedAddresses: void => void = () => {
    this.setState(prevState => ({ showUsed: !prevState.showUsed }));
  };

  render(): Node {
    const {
      walletAddresses,
      onVerifyAddress, onGeneratePaymentURI,
      onCopyAddressTooltip, notification,
    } = this.props;
    const { intl } = this.context;
    const { showUsed } = this.state;

    const walletReceiveContent = (
      <>
        <div className={styles.generatedAddresses}>
          <h2>
            {intl.formatMessage(messages.generatedAddressesSectionTitle)}
            <button type="button" onClick={this.toggleUsedAddresses}>
              {intl.formatMessage(messages[showUsed ? 'hideUsedLabel' : 'showUsedLabel'])}
            </button>
          </h2>
          {walletAddresses.map((address, index) => {
            const isAddressVisible = address.isUsed === false || showUsed;
            if (!isAddressVisible) return null;
            const addressClasses = classnames([
              'generatedAddress-' + (index + 1),
              styles.walletAddress,
              address.isUsed === true ? styles.usedWalletAddress : null,
            ]);
            const notificationElementId = `address-${index}-copyNotification`;
            return (
              <div key={`gen-${address.address}`} className={addressClasses}>
                {/* Address Id */}
                <CopyableAddress
                  hash={address.address}
                  elementId={notificationElementId}
                  onCopyAddress={
                    () => onCopyAddressTooltip(address.address, notificationElementId)
                  }
                  notification={notification}
                >
                  <ExplorableHashContainer
                    selectedExplorer={this.props.selectedExplorer}
                    hash={address.address}
                    light={address.isUsed === true}
                    linkType="address"
                  >
                    <RawHash light={address.isUsed === true}>
                      <span
                        className={classnames([
                          styles.addressHash,
                          address.isUsed === true && styles.addressHashUsed
                        ])}
                      >
                        {truncateAddress(address.address)}
                      </span>
                    </RawHash>
                  </ExplorableHashContainer>
                </CopyableAddress>
                <div className={styles.addressMargin} />
                {/* Address Action block start */}
                <div className={styles.addressActions}>
                  {/* Generate payment URL for Address action */}
                  {/* disable URI for Shelley testnet */}
                  {!environment.isShelley() && onGeneratePaymentURI != null && (
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
                          <span className={styles.actionIconText}>
                            {intl.formatMessage(messages.generatePaymentURLLabel)}
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
                        onVerifyAddress.bind(this, {
                          address: address.address,
                          path: address.addressing?.path
                        })
                      }
                    >
                      <div>
                        <span className={styles.verifyIcon}>
                          <VerifyIcon />
                        </span>
                        <span>{intl.formatMessage(messages.verifyAddressLabel)}</span>
                      </div>
                    </button>
                  </div>
                </div>
                {/* Action block end */}
              </div>
            );
          })}
        </div>
      </>
    );

    return (
      <div className={styles.component}>
        {this.props.header}
        {walletReceiveContent}
      </div>
    );
  }
}

function truncateAddress(addr: string): string {
  if (addr.length <= 63) {
    return addr;
  }
  return addr.substring(0, 30) + '...' + addr.substring(addr.length - 30, addr.length);
}
