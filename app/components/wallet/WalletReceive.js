// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';
import QRCode from 'qrcode.react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import BorderedBox from '../widgets/BorderedBox';
import VerifyIcon from '../../assets/images/verify-icon.inline.svg';
import GenerateURIIcon from '../../assets/images/generate-uri.inline.svg';
import LocalizableError from '../../i18n/LocalizableError';
import LoadingSpinner from '../widgets/LoadingSpinner';
import styles from './WalletReceive.scss';
import CopyableAddress from '../widgets/CopyableAddress';
import RawHash from '../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import type { ExplorerType } from '../../domain/Explorer';
import type { StandardAddress } from '../../stores/base/AddressesStore';
import environment from '../../environment';
import type { Notification } from '../../types/notificationType';

const messages = defineMessages({
  walletAddressLabel: {
    id: 'wallet.receive.page.walletAddressLabel',
    defaultMessage: '!!!Your wallet address',
  },
  walletReceiveInstructions: {
    id: 'wallet.receive.page.walletReceiveInstructions',
    defaultMessage: '!!!Share this wallet address to receive payments. To protect your privacy, new addresses are generated automatically once you use them.',
  },
  generateNewAddressButtonLabel: {
    id: 'wallet.receive.page.generateNewAddressButtonLabel',
    defaultMessage: '!!!Generate new address',
  },
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
  +walletAddress: string,
  +selectedExplorer: ExplorerType,
  +isWalletAddressUsed: boolean,
  +walletAddresses: Array<StandardAddress>,
  +onGenerateAddress: Function,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +onVerifyAddress: Function,
  +onGeneratePaymentURI: Function,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

type State = {
  showUsed: boolean,
};

@observer
export default class WalletReceive extends Component<Props, State> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    showUsed: true,
  };

  toggleUsedAddresses = () => {
    this.setState(prevState => ({ showUsed: !prevState.showUsed }));
  };

  submit = () => {
    this.props.onGenerateAddress();
  }

  loadingSpinner: ?LoadingSpinner;

  render() {
    const {
      walletAddress, walletAddresses,
      onVerifyAddress, onGeneratePaymentURI,
      isSubmitting, error, isWalletAddressUsed,
      onCopyAddressTooltip, notification,
    } = this.props;
    const { intl } = this.context;
    const { showUsed } = this.state;
    const mainAddressNotificationId = 'mainAddress-copyNotification';

    const generateAddressButtonClasses = classnames([
      'primary',
      'generateAddressButton',
      styles.submitButton,
      isSubmitting ? styles.spinning : null,
    ]);

    const generateAddressForm = (
      <Button
        className={generateAddressButtonClasses}
        label={intl.formatMessage(messages.generateNewAddressButtonLabel)}
        onMouseUp={this.submit}
        skin={ButtonSkin}
      />
    );

    const copyableHashClass = classnames([
      styles.copyableHash,
    ]);

    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color') : 'transparent';
    const qrCodeForegroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color') : '#000';

    const walletReceiveContent = (
      <BorderedBox>
        <div className={styles.qrCodeAndInstructions}>
          <div className={styles.instructions}>
            <div className={styles.hashLabel}>
              {intl.formatMessage(messages.walletAddressLabel)}
            </div>
            <CopyableAddress
              hash={walletAddress}
              elementId={mainAddressNotificationId}
              onCopyAddress={() => onCopyAddressTooltip(walletAddress, mainAddressNotificationId)}
              notification={notification}
            >
              <ExplorableHashContainer
                selectedExplorer={this.props.selectedExplorer}
                hash={walletAddress}
                light={isWalletAddressUsed}
                linkType="address"
              >
                <RawHash light={isWalletAddressUsed}>
                  <span className={copyableHashClass}>{walletAddress}</span>
                </RawHash>
              </ExplorableHashContainer>
            </CopyableAddress>
            <div className={styles.postCopyMargin} />
            <div className={styles.instructionsText}>
              <FormattedHTMLMessage {...messages.walletReceiveInstructions} />
            </div>
            {generateAddressForm}
            {error
              ? <p className={styles.error}>{intl.formatMessage(error)}</p>
              : <p className={styles.error}>&nbsp;</p>}
          </div>
          <div className={styles.qrCode}>
            <QRCode
              value={walletAddress}
              bgColor={qrCodeBackgroundColor}
              fgColor={qrCodeForegroundColor}
              size={152}
            />
          </div>
        </div>

        <div className={styles.generatedAddresses}>
          <h2>
            {intl.formatMessage(messages.generatedAddressesSectionTitle)}
            <button type="button" onClick={this.toggleUsedAddresses}>
              {intl.formatMessage(messages[showUsed ? 'hideUsedLabel' : 'showUsedLabel'])}
            </button>
          </h2>
          {walletAddresses.map((address, index) => {
            const isAddressVisible = !address.isUsed || showUsed;
            if (!isAddressVisible) return null;
            const addressClasses = classnames([
              'generatedAddress-' + (index + 1),
              styles.walletAddress,
              address.isUsed ? styles.usedWalletAddress : null,
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
                    light={address.isUsed}
                    linkType="address"
                  >
                    <RawHash light={address.isUsed}>
                      {address.address}
                    </RawHash>
                  </ExplorableHashContainer>
                </CopyableAddress>
                <div className={styles.addressMargin} />
                {/* Address Action block start */}
                <div className={styles.addressActions}>
                  {/* Generate payment URL for Address action */}
                  {!environment.isShelley() && // disable URI for Shelley testnet
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
                  }
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
                          path: address.addressing.path
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
      </BorderedBox>
    );

    const loadingSpinner =
      <LoadingSpinner ref={(component) => { this.loadingSpinner = component; }} />;

    return (
      <div className={styles.component}>
        {walletAddress ? walletReceiveContent : loadingSpinner}
      </div>
    );
  }
}
