// @flow

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import LocalizableError from '../../../i18n/LocalizableError';
import WalletTransaction from '../../../domain/WalletTransaction';
import styles from './MemoDialogCommon.scss';

const messages = defineMessages({
  deleteMemoTitle: {
    id: 'wallet.transaction.memo.delete.dialog.title',
    defaultMessage: '!!!Delete memo',
  },
  deleteMemoContent: {
    id: 'wallet.transaction.memo.delete.dialog.content',
    defaultMessage: '!!!Are you sure you want to remove the memo for this transaction?',
  },
  deleteMemoActionsCancel: {
    id: 'wallet.transaction.memo.delete.dialog.actions.cancel',
    defaultMessage: '!!!Cancel',
  },
  deleteMemoActionsDelete: {
    id: 'wallet.transaction.memo.delete.dialog.actions.delete',
    defaultMessage: '!!!Delete',
  },
});

type Props = {|
  selectedTransaction: WalletTransaction,
  error: ?LocalizableError,
  onCancel: void => void,
  onClose: void => void,
  onDelete: string => Promise<void>,
|};

type State = {|
  isSubmitting: boolean,
|};

@observer
export default class DeleteMemoDialog extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    isSubmitting: false,
  };

  render() {
    const { intl } = this.context;
    const { isSubmitting } = this.state;
    const {
      error,
      selectedTransaction,
      onCancel,
      onClose,
      onDelete,
    } = this.props;

    const actions = [
      {
        className: isSubmitting ? styles.isSubmitting : null,
        label: this.context.intl.formatMessage(messages.deleteMemoActionsCancel),
        onClick: onCancel,
        disabled: isSubmitting
      },
      {
        className: isSubmitting ? styles.isSubmitting : null,
        label: this.context.intl.formatMessage(messages.deleteMemoActionsDelete),
        primary: true,
        onClick: () => onDelete(selectedTransaction.txid),
        disabled: isSubmitting
      },
    ];

    return (
      <Dialog
        className={classnames([styles.component])}
        title={intl.formatMessage(messages.deleteMemoTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onClose}
      >
        <div className={styles.content}>
          { error ? (<ErrorBlock error={error} />) : null }
          <FormattedHTMLMessage {...messages.deleteMemoContent} />
        </div>
      </Dialog>);
  }
}
