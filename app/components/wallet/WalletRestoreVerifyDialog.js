// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, FormattedHTMLMessage, intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import styles from './WalletRestoreVerifyDialog.scss';
import DialogBackButton from '../widgets/DialogBackButton';
import CopyableAddress from '../widgets/CopyableAddress';
import RawHash from '../widgets/hashWrappers/RawHash';
import WalletAccountIcon from '../topbar/WalletAccountIcon';
import Dialog from '../widgets/Dialog';
import DialogTextBlock from '../widgets/DialogTextBlock';
import type { WalletAccountNumberPlate } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import LocalizableError from '../../i18n/LocalizableError';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import type { ExplorerType } from '../../domain/Explorer';
import type { Notification } from '../../types/notificationType';
import type { PlateResponse } from '../../api/ada/lib/cardanoCrypto/plate';
import CenteredLayout from '../layout/CenteredLayout';
import environment from '../../environment';

const messages = defineMessages({
  dialogTitleVerifyWalletRestoration: {
    id: 'wallet.restore.dialog.verify.title',
    defaultMessage: '!!!Verify Restored Wallet',
  },
  walletRestoreVerifyIntroLine1: {
    id: 'wallet.restore.dialog.verify.intro.line1',
    defaultMessage: '!!!Be careful about wallet restoration:',
  },
  walletRestoreVerifyIntroLine2: {
    id: 'wallet.restore.dialog.verify.intro.line2',
    defaultMessage: '!!!Make sure account checksum and icon match what you remember.',
  },
  walletRestoreVerifyIntroLine3: {
    id: 'wallet.restore.dialog.verify.intro.line3',
    defaultMessage: '!!!Make sure addresses match what you remember',
  },
  walletRestoreVerifyIntroLine4: {
    id: 'wallet.restore.dialog.verify.intro.line4',
    defaultMessage: '!!!If you\'ve entered wrong mnemonics or a wrong paper wallet password -' +
      ' you will just open another empty wallet with wrong account checksum and wrong addresses!',
  },
  walletRestoreVerifyAccountIdLabel: {
    id: 'wallet.restore.dialog.verify.accountId.label',
    defaultMessage: '!!!Your Wallet Account checksum:',
  },
  walletRestoreVerifyByronAccountIdLabel: {
    id: 'wallet.restore.dialog.verify.accountId.byron.label',
    defaultMessage: '!!!Byron account checksum:',
  },
  walletRestoreVerifyShelleyAccountIdLabel: {
    id: 'wallet.restore.dialog.verify.accountId.shelley.label',
    defaultMessage: '!!!Shelley account checksum:',
  },
  walletRestoreVerifyAddressesLabel: {
    id: 'wallet.restore.dialog.verify.addressesLabel',
    defaultMessage: '!!!Your Wallet address[es]:',
  },
  walletRestoreVerifyByronAddressesLabel: {
    id: 'wallet.restore.dialog.verify.byron.addressesLabel',
    defaultMessage: '!!!Byron Wallet address[es]:',
  },
  walletRestoreVerifyShelleyAddressesLabel: {
    id: 'wallet.restore.dialog.verify.shelley.addressesLabel',
    defaultMessage: '!!!Shelley Wallet address[es]:',
  },
});

type Props = {|
  +byronPlate: void | PlateResponse,
  +shelleyPlate: void | PlateResponse,
  +selectedExplorer: ExplorerType,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +onNext: void => PossiblyAsync<void>,
  +onCancel: void => void,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

@observer
export default class WalletRestoreVerifyDialog extends Component<Props> {
  static defaultProps = {
    error: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  generatePlate(
    title: string,
    plate: WalletAccountNumberPlate,
  ) {
    return (
      <div>
        <h2 className={styles.addressLabel}>
          {title}
        </h2>
        <div className={styles.plateRowDiv}>
          <WalletAccountIcon
            iconSeed={plate.hash}
          />
          <span className={styles.plateIdSpan}>{plate.id}</span>
        </div>
      </div>
    );
  }

  generateAddresses(
    title: string,
    addresses: Array<string>,
    onCopyAddressTooltip: (string, string) => void,
    notification: ?Notification,
  ) {
    return (
      <div>
        <h2 className={styles.addressLabel}>
          {title}
        </h2>
        {addresses.map((address, index) => {
          const notificationElementId = `${address}-${index}`;
          return (
            <CopyableAddress
              hash={address}
              elementId={notificationElementId}
              onCopyAddress={() => onCopyAddressTooltip(address, notificationElementId)}
              notification={notification}
              tooltipOpensUpward
              key={address}
            >
              <ExplorableHashContainer
                selectedExplorer={this.props.selectedExplorer}
                hash={address}
                light
                tooltipOpensUpward
                linkType="address"
              >
                <RawHash light>
                  {address}
                </RawHash>
              </ExplorableHashContainer>
            </CopyableAddress>
          );
        })}
      </div>
    );
  }

  render() {
    const { intl } = this.context;
    const {
      byronPlate,
      shelleyPlate,
      error,
      isSubmitting,
      onCancel,
      onNext,
      onCopyAddressTooltip,
      notification,
    } = this.props;

    const dialogClasses = classnames(['walletRestoreVerifyDialog', styles.dialog]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: onCancel,
        disabled: !environment.isShelley() && isSubmitting,
      },
      {
        label: intl.formatMessage(globalMessages.confirm),
        onClick: onNext,
        primary: true,
        className: classnames(['confirmButton']),
        isSubmitting: !environment.isShelley() && isSubmitting,
      },
    ];

    const introMessage = (
      <div>
        <span>{intl.formatMessage(messages.walletRestoreVerifyIntroLine1)}</span><br />
        <ul>
          <li className={styles.smallTopMargin}>
            <span><FormattedHTMLMessage {...messages.walletRestoreVerifyIntroLine2} /></span>
          </li>
          <li className={styles.smallTopMargin}>
            <span><FormattedHTMLMessage {...messages.walletRestoreVerifyIntroLine3} /></span>
          </li>
          <li className={styles.smallTopMargin}>
            <span><FormattedHTMLMessage {...messages.walletRestoreVerifyIntroLine4} /></span>
          </li>
        </ul>
      </div>
    );

    const byronPlateElem = byronPlate == null
      ? undefined
      : this.generatePlate(
        shelleyPlate == null
          ? intl.formatMessage(messages.walletRestoreVerifyAccountIdLabel)
          : intl.formatMessage(messages.walletRestoreVerifyByronAccountIdLabel),
        byronPlate.accountPlate
      );

    const shelleyPlateElem = shelleyPlate == null
      ? undefined
      : this.generatePlate(
        byronPlate == null
          ? intl.formatMessage(messages.walletRestoreVerifyAccountIdLabel)
          : intl.formatMessage(messages.walletRestoreVerifyShelleyAccountIdLabel),
        shelleyPlate.accountPlate
      );

    const byronAddressesElem = byronPlate == null
      ? undefined
      : this.generateAddresses(
        shelleyPlate == null
          ? intl.formatMessage(messages.walletRestoreVerifyAddressesLabel)
          : intl.formatMessage(messages.walletRestoreVerifyByronAddressesLabel),
        byronPlate.addresses,
        onCopyAddressTooltip,
        notification,
      );

    const shelleyAddressesElem = shelleyPlate == null
      ? undefined
      : this.generateAddresses(
        byronPlate == null
          ? intl.formatMessage(messages.walletRestoreVerifyAddressesLabel)
          : intl.formatMessage(messages.walletRestoreVerifyShelleyAddressesLabel),
        shelleyPlate.addresses,
        onCopyAddressTooltip,
        notification,
      );

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleVerifyWalletRestoration)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        backButton={<DialogBackButton onBack={onCancel} />}
      >
        <DialogTextBlock>
          {introMessage}
        </DialogTextBlock>

        <DialogTextBlock>
          <CenteredLayout>
            {byronPlateElem}
            {shelleyPlateElem}
          </CenteredLayout>
        </DialogTextBlock>

        <DialogTextBlock subclass="component-bottom">
          {byronAddressesElem}<br />
          {shelleyAddressesElem}
        </DialogTextBlock>

        <div className={styles.postCopyMargin} />

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

      </Dialog>
    );
  }

}
