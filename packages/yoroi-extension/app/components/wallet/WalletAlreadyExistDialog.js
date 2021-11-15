// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import styles from './WalletAlreadyExistDialog.scss';
import DialogBackButton from '../widgets/DialogBackButton';
import Dialog from '../widgets/Dialog';
import LocalizableError from '../../i18n/LocalizableError';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { Notification } from '../../types/notificationType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { PlateWithMeta } from '../../stores/toplevel/WalletRestoreStore';
import NavPlate from '../topbar/NavPlate';

const messages = defineMessages({
  walletAlreadyExist: {
    id: 'wallet.restore.dialog.checkExistence.title',
    defaultMessage: '!!!Wallet Already Exist',
  },
  openWallet: {
    id: 'wallet.restore.dialog.checkExistence.openWallet',
    defaultMessage: '!!!Open Wallet:',
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
});

type Props = {|
  +plates: PlateWithMeta,
  +onNext: void => PossiblyAsync<void>,
  +onCancel: void => void,
  +settingsCache: any
|};

@observer
export default class WalletAlreadyExistDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      onCancel,
      onNext,
      plate,
      settingsCache
    } = this.props;

    const dialogClasses = classnames(['walletRestoreVerifyDialog', styles.dialog]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: onCancel,
      },
      {
        label: intl.formatMessage(globalMessages.confirm),
        onClick: onNext,
        primary: true,
        className: classnames(['confirmButton']),
      },
    ];
    return (
      <Dialog
        title={intl.formatMessage(messages.walletAlreadyExist)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        backButton={<DialogBackButton onBack={onCancel} />}
      >

        <NavPlate
          plate={plate}
          wallet={settingsCache}
        />
      </Dialog>
    );
  }

}
