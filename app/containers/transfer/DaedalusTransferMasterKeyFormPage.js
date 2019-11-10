// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import TransferMasterKeyPage from '../../components/transfer/TransferMasterKeyPage';

const messages = defineMessages({
  step0: {
    id: 'daedalusTransfer.form.instructions.step0MasterKey.text',
    defaultMessage: '!!!Enter the unencrypted master key for your Daedalus wallet to restore the balance and transfer all the funds from Daedalus to Yoroi.',
  },
});

type Props = {|
  onSubmit: Function,
  onBack: Function,
  classicTheme: boolean,
|};

@observer
export default class DaedalusTransferMasterKeyFormPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { onBack, onSubmit, classicTheme } = this.props;

    return (
      <TransferMasterKeyPage
        onSubmit={onSubmit}
        onBack={onBack}
        step0={intl.formatMessage(messages.step0)}
        classicTheme={classicTheme}
      />
    );
  }
}
