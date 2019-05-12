// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
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
import magnifyingGlass from '../../assets/images/search-ic-dark.inline.svg';
import WalletAddress from '../../domain/WalletAddress';
import LocalizableError from '../../i18n/LocalizableError';
import LoadingSpinner from '../widgets/LoadingSpinner';
import styles from './WalletReceive.scss';
import CopyableAddress from '../widgets/CopyableAddress';

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
});

type Props = {
  walletAddress: string,
  isWalletAddressUsed: boolean,
  walletAddresses: Array<WalletAddress>,
  onGenerateAddress: Function,
  onCopyAddress: Function,
  onAddressDetail: Function,
  isSubmitting: boolean,
  error?: ?LocalizableError,
  classicTheme: boolean,
  notification: Node
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
      onCopyAddress, onAddressDetail,
      isSubmitting, error, isWalletAddressUsed,
      classicTheme,
      notification
    } = this.props;
    const { intl } = this.context;
    const { showUsed } = this.state;

    const generateAddressButtonClasses = classnames([
      'primary',
      'generateAddressButton',
      styles.submitButton,
      isSubmitting ? styles.spinning : null,
    ]);

    const qrCodeAndInstructionsClasses = classicTheme
      ? styles.qrCodeAndInstructionsClassic
      : styles.qrCodeAndInstructions;

    const generatedAddressesClasses = classicTheme
      ? styles.generatedAddressesClassic
      : styles.generatedAddresses;

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
        <div className={qrCodeAndInstructionsClasses}>
          <div className={styles.instructions}>
            <div className={styles.hashLabel}>
              {intl.formatMessage(messages.walletAddressLabel)}
            </div>
            <CopyableAddress
              address={walletAddress}
              isClassicThemeActive={classicTheme}
              onCopyAddress={onCopyAddress}
              isUsed={isWalletAddressUsed}
            />
            {!classicTheme && notification}
            <div className={styles.instructionsText}>
              {intl.formatMessage(messages.walletReceiveInstructions)}
            </div>
            {error
              ? <p className={styles.error}>{intl.formatMessage(error)}</p>
              : <p className={styles.error} />}
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

        <div className={generatedAddressesClasses}>
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
                  <span className={styles.addressIcon}>
                    <SvgInline
                      svg={magnifyingGlass}
                      className={styles.copyIcon}
                      onClick={
                        onAddressDetail.bind(this, { address: address.id, path: address.path })
                      }
                    />
                  </span>
                  &nbsp;
                  <CopyToClipboard
                    text={address.id}
                    onCopy={onCopyAddress.bind(this, address.id)}
                  >
                    <span className={styles.addressIcon}>
                      <SvgInline svg={iconCopy} className={styles.copyIcon} />
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
      <div className={classicTheme ? styles.componentClassic : styles.component}>
        {walletAddress ? walletReceiveContent : loadingSpinner}
      </div>
    );
  }
}
