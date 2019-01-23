// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';
import classnames from 'classnames';
import CopyToClipboard from 'react-copy-to-clipboard';
import QRCode from 'qrcode.react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import BorderedBox from '../widgets/BorderedBox';
import iconCopy from '../../assets/images/clipboard-ic.inline.svg';
import WalletAddress from '../../domain/WalletAddress';
import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import LoadingSpinner from '../widgets/LoadingSpinner';
import styles from './WalletReceive.scss';

const messages = defineMessages({
  walletAddressLabel: {
    id: 'wallet.receive.page.walletAddressLabel',
    defaultMessage: '!!!Your wallet address',
    description: 'Label for wallet address on the wallet "Receive page"',
  },
  walletReceiveInstructions: {
    id: 'wallet.receive.page.walletReceiveInstructions',
    defaultMessage: '!!!Share this wallet address to receive payments. To protect your privacy, new addresses are generated automatically once you use them.',
    description: 'Wallet receive payments instructions on the wallet "Receive page"',
  },
  generateNewAddressButtonLabel: {
    id: 'wallet.receive.page.generateNewAddressButtonLabel',
    defaultMessage: '!!!Generate new address',
    description: 'Label for "Generate new address" button on the wallet "Receive page"',
  },
  generatedAddressesSectionTitle: {
    id: 'wallet.receive.page.generatedAddressesSectionTitle',
    defaultMessage: '!!!Generated addresses',
    description: '"Generated addresses" section title on the wallet "Receive page"',
  },
  hideUsedLabel: {
    id: 'wallet.receive.page.hideUsedLabel',
    defaultMessage: '!!!hide used',
    description: 'Label for "hide used" wallet addresses link on the wallet "Receive page"',
  },
  showUsedLabel: {
    id: 'wallet.receive.page.showUsedLabel',
    defaultMessage: '!!!show used',
    description: 'Label for "show used" wallet addresses link on the wallet "Receive page"',
  },
  copyAddressLabel: {
    id: 'wallet.receive.page.copyAddressLabel',
    defaultMessage: '!!!Copy address',
    description: 'Label for "Copy address" link on the wallet "Receive page"',
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  walletAddress: string,
  isWalletAddressUsed: boolean,
  walletAddresses: Array<WalletAddress>,
  onGenerateAddress: Function,
  onCopyAddress: Function,
  isSubmitting: boolean,
  error?: ?LocalizableError,
};

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
      onCopyAddress,
      isSubmitting, error, isWalletAddressUsed,
    } = this.props;
    const { intl } = this.context;
    const { showUsed } = this.state;

    const walletAddressClasses = classnames([
      styles.hash,
      isWalletAddressUsed ? styles.usedHash : null,
    ]);

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
            <div className={walletAddressClasses}>
              {walletAddress}
              <CopyToClipboard
                text={walletAddress}
                onCopy={onCopyAddress.bind(this, walletAddress)}
              >
                <SvgInline svg={iconCopy} className={styles.copyIconBig} cleanup={['title']} />
              </CopyToClipboard>
            </div>
            <div className={styles.instructionsText}>
              {intl.formatMessage(messages.walletReceiveInstructions)}
            </div>
            {error ? <p className={styles.error}>{intl.formatMessage(error)}</p> : null}
            {generateAddressForm}
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
            return (
              <div key={`gen-${address.id}`} className={addressClasses}>
                <div className={styles.addressId}>{address.id}</div>
                <div className={styles.addressActions}>
                  <CopyToClipboard
                    text={address.id}
                    onCopy={onCopyAddress.bind(this, address.id)}
                  >
                    <span className={styles.copyAddress}>
                      <SvgInline svg={iconCopy} className={styles.copyIcon} cleanup={['title']} />
                      <span>{intl.formatMessage(messages.copyAddressLabel)}</span>
                    </span>
                  </CopyToClipboard>
                </div>
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
