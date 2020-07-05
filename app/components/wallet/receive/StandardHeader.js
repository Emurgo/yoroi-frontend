// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';
import QRCode from 'qrcode.react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './StandardHeader.scss';
import CopyableAddress from '../../widgets/CopyableAddress';
import RawHash from '../../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { Notification } from '../../../types/notificationType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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
});

type Props = {|
  +walletAddress: string,
  +selectedExplorer: SelectedExplorer,
  +isWalletAddressUsed: boolean,
  +onGenerateAddress: void => Promise<void>,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
  +isFilterActive: boolean,
|};

@observer
export default class StandardHeader extends Component<Props> {
  static defaultProps: {|error: void|} = {
    error: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  submit: void => Promise<void> = async () => {
    await this.props.onGenerateAddress();
  }

  render(): Node {
    const {
      walletAddress,
      isSubmitting, error, isWalletAddressUsed,
      onCopyAddressTooltip, notification,
    } = this.props;
    const { intl } = this.context;
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
        disabled={this.props.isFilterActive}
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

    const walletHeader = (
      <div className={styles.qrCodeAndInstructions}>
        <div className={styles.instructions}>
          <div className={styles.hashLabel}>
            {intl.formatMessage(messages.walletAddressLabel)}
          </div>
          <CopyableAddress
            darkVariant
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
                <span className={copyableHashClass}>
                  {truncateAddress(walletAddress)}
                </span>
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
    );

    return walletHeader;
  }
}

function truncateAddress(addr: string): string {
  if (addr.length <= 63) {
    return addr;
  }
  return addr.substring(0, 30) + '...' + addr.substring(addr.length - 30, addr.length);
}
