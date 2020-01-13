// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { action, observable } from 'mobx';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import DaedalusMasterKeyInput from '../../components/widgets/forms/DaedalusMasterKeyInput';
import BaseTransferPage from '../../components/transfer/BaseTransferPage';

const messages = defineMessages({
  step0: {
    id: 'daedalusTransfer.form.instructions.step0MasterKey.text',
    defaultMessage: '!!!Enter the unencrypted master key for your Daedalus wallet to restore the balance and transfer all the funds from Daedalus to Yoroi.',
  },
});

type Props = {|
  +onSubmit: {| masterKey: string, |} => PossiblyAsync<void>,
  +onBack: void => void,
  +classicTheme: boolean,
|};

@observer
export default class DaedalusTransferMasterKeyFormPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  @observable masterKeyForm: void | ReactToolboxMobxForm;

  @action
  setMasterKeyFrom(form: ReactToolboxMobxForm) {
    this.masterKeyForm = form;
  }

  submit = async () => {
    if (this.masterKeyForm == null) {
      throw new Error('DaedalusTransferMasterKeyFormPage form not set');
    }
    this.masterKeyForm.submit({
      onSuccess: async (form) => {
        await this.props.onSubmit(form.values());
      },
      onError: () => {}
    });
  };

  render() {
    const { intl } = this.context;
    return (
      <BaseTransferPage
        onSubmit={this.submit}
        onBack={this.props.onBack}
        step0={intl.formatMessage(messages.step0)}
        classicTheme={this.props.classicTheme}
        isDisabled={this.masterKeyForm == null || this.masterKeyForm.hasError}
      >
        <DaedalusMasterKeyInput
          setForm={(form) => this.setMasterKeyFrom(form)}
          classicTheme={this.props.classicTheme}
        />
      </BaseTransferPage>
    );
  }
}
