// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';

import LocalizableError from '../../../i18n/LocalizableError';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';

import styles from './ExportTransactionDialog.scss';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.transaction.export.dialog.title',
    defaultMessage: '!!!Export transactions to file',
  },
  infoText1: {
    id: 'wallet.transaction.export.dialog.infoText1',
    defaultMessage: '!!!The entire transaction history within your wallet will be exported to a file',
  },
  exportButtonLabel: {
    id: 'wallet.transaction.export.dialog.exportButton.label',
    defaultMessage: '!!!Export',
  }
});

type Props = {|
  isActionProcessing: ?boolean,
  error: ?LocalizableError,
  submit: Function,
  cancel: Function,
  classicTheme: boolean,
|};

@observer
export default class ExportTransactionDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const {
      isActionProcessing,
      error,
      submit,
      cancel
    } = this.props;

    const infoBlock = (
      <div className={styles.infoBlock}>
        <span>{intl.formatMessage(messages.infoText1)}</span>
      </div>);

    const dailogActions = [{
      className: isActionProcessing ? styles.processing : null,
      label: intl.formatMessage(messages.exportButtonLabel),
      primary: true,
      disabled: isActionProcessing || false,
      onClick: submit,
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'ExportTransactionDialog'])}
        title={intl.formatMessage(messages.dialogTitle)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
        classicTheme={this.props.classicTheme}
      >
        {infoBlock}
        {error && <ErrorBlock error={error} />}
      </Dialog>);
  }
}
