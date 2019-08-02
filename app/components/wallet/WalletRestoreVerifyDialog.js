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
import type { WalletAccountNumberPlate } from '../../domain/Wallet';
import LocalizableError from '../../i18n/LocalizableError';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import type { ExplorerType } from '../../domain/Explorer';

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
  walletRestoreVerifyAddressesLabel: {
    id: 'wallet.restore.dialog.verify.addressesLabel',
    defaultMessage: '!!!Your Wallet address[es]:',
  },
});

type Props = {|
  addresses: Array<string>,
  accountPlate: WalletAccountNumberPlate,
  selectedExplorer: ExplorerType,
  onCopyAddressTooltip: Function,
  getNotification: Function,
  onNext: Function,
  onCancel: Function,
  isSubmitting: boolean,
  classicTheme: boolean,
  error?: ?LocalizableError,
|};

@observer
export default class WalletRestoreVerifyDialog extends Component<Props> {
  static defaultProps = {
    error: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      addresses,
      accountPlate,
      error,
      isSubmitting,
      onCancel,
      onNext,
      classicTheme,
      onCopyAddressTooltip,
      getNotification,
    } = this.props;

    const dialogClasses = classnames(['walletRestoreVerifyDialog', styles.dialog]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: onCancel
      },
      {
        label: intl.formatMessage(globalMessages.confirm),
        onClick: onNext,
        primary: true,
        className: classnames(['confirmButton', isSubmitting ? styles.isSubmitting : null]),
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

    const walletPlate = (
      <div>
        <h2 className={styles.addressLabel}>
          {intl.formatMessage(messages.walletRestoreVerifyAccountIdLabel)}
        </h2>
        <div className={styles.plateRowDiv}>
          <WalletAccountIcon
            iconSeed={accountPlate.hash}
          />
          <span className={styles.plateIdSpan}>{accountPlate.id}</span>
        </div>
      </div>
    );

    const walletAddresses = (
      <div>
        <h2 className={styles.addressLabel}>
          {intl.formatMessage(messages.walletRestoreVerifyAddressesLabel)}
        </h2>
        {addresses.map(a => (
          <CopyableAddress
            hash={a}
            onCopyAddress={onCopyAddress}
            key={a}
          >
            <ExplorableHashContainer
              selectedExplorer={this.props.selectedExplorer}
              hash={a}
              light
              tooltipOpensUpward
              linkType="address"
            >
              <RawHash light>
                {a}
              </RawHash>
            </ExplorableHashContainer>
          </CopyableAddress>
        ))}
      </div>
    );

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleVerifyWalletRestoration)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        backButton={<DialogBackButton onBack={onCancel} />}
        classicTheme={classicTheme}
      >
        <DialogTextBlock>
          {introMessage}
        </DialogTextBlock>

        <DialogTextBlock>
          {walletPlate}
        </DialogTextBlock>

        <DialogTextBlock subclass="component-bottom">
          {walletAddresses}
        </DialogTextBlock>

        <div className={styles.postCopyMargin} />

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

      </Dialog>
    );
  }

}
