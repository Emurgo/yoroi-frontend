// @flow

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import CenteredLayout from '../../layout/CenteredLayout';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import styles from './DelegationTxDialog.scss';
import SuccessPage from '../../transfer/SuccessPage';

const messages = defineMessages({
  title: {
    id: 'wallet.delegation.transaction.success.title',
    defaultMessage: '!!!Successfully delegated',
  },
  buttonLabel: {
    id: 'wallet.delegation.transaction.success.button.label',
    defaultMessage: '!!!Dashboard page',
  },
  explanation: {
    id: 'wallet.delegation.transaction.success.explanation',
    defaultMessage: '!!!Track the status of the stake pool and the amount of time remaining to receive a reward from the Dashboard page',
  }
});

type Props = {|
  +onClose: void => void;
  +classicTheme: boolean,
|};

@observer
export default class DelegationSuccessDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    const actions = [
      {
        label: intl.formatMessage(messages.buttonLabel),
        onClick: this.props.onClose,
        primary: true
      }
    ];

    return (
      <Dialog
        title=""
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onClose}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
        classicTheme={this.props.classicTheme}
      >
        <CenteredLayout>
          <SuccessPage
            title={intl.formatMessage(messages.title)}
            text={intl.formatMessage(messages.explanation)}
            classicTheme={this.props.classicTheme}
          />
        </CenteredLayout>
      </Dialog>
    );
  }
}
