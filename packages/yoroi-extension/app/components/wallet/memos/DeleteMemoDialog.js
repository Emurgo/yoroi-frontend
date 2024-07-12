// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import LocalizableError from '../../../i18n/LocalizableError';
import WalletTransaction from '../../../domain/WalletTransaction';
import globalMessages, { memoMessages, } from '../../../i18n/global-messages';
import styles from './MemoDialogCommon.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  deleteMemoContent: {
    id: 'wallet.transaction.memo.delete.dialog.content',
    defaultMessage: '!!!Are you sure you want to remove the memo for this transaction?',
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

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isSubmitting: false,
  };

  render(): Node {
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
        label: this.context.intl.formatMessage(globalMessages.cancel),
        onClick: onCancel,
        disabled: isSubmitting,
      },
      {
        className: isSubmitting ? styles.isSubmitting : null,
        label: this.context.intl.formatMessage(messages.deleteMemoActionsDelete),
        primary: true,
        onClick: () => onDelete(selectedTransaction.txid),
        isSubmitting,
      },
    ];

    return (
      <Dialog
        className={classnames([styles.component])}
        title={intl.formatMessage(memoMessages.deleteMemo)}
        actions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onClose}
        id='deleteMemoDialog'
      >
        <div className={styles.content}>
          { error ? (<ErrorBlock error={error} />) : null }
          <FormattedHTMLMessage {...messages.deleteMemoContent} />
        </div>
      </Dialog>);
  }
}
