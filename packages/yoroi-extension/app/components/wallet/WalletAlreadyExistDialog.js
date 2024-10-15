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
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  walletAlreadyExist: {
    id: 'wallet.restore.dialog.walletExist.title',
    defaultMessage: '!!!Wallet already exist',
  },
  openWallet: {
    id: 'wallet.restore.dialog.walletExist.openWallet',
    defaultMessage: '!!!Open Wallet',
  },
  explanation: {
    id: 'wallet.restore.dialog.walletExist.explanation',
    defaultMessage: '!!!The wallet you are trying to restore already exists.',
  }
});

type Props = {|
  +walletPlate: Node,
  +walletSumDetails: Node,
  +onCancel: void => void,
  +openWallet: void => void,
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
      openWallet,
      walletPlate,
      walletSumDetails
    } = this.props;

    const dialogClasses = classnames([styles.component, styles.dialog]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: onCancel,
      },
      {
        label: intl.formatMessage(messages.openWallet),
        onClick: openWallet,
        primary: true,
        className: classnames(['confirmButton']),
      },
    ];
    return (
      <Dialog
        title={intl.formatMessage(messages.walletAlreadyExist)}
        dialogActions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        backButton={<DialogBackButton onBack={onCancel} />}
      >
        <div className={styles.wrapper}>
          <div> {walletPlate}</div>
          <div>{walletSumDetails}</div>
        </div>
        <div className={styles.explanation}>{intl.formatMessage(messages.explanation)}</div>
      </Dialog>
    );
  }

}
