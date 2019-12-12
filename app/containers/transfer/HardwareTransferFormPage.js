// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { join } from 'lodash';
import { action, observable } from 'mobx';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import MnemonicInput from '../../components/widgets/forms/MnemonicInput';
import BaseTransferPage from '../../components/transfer/BaseTransferPage';
import globalMessages from '../../i18n/global-messages';

type Props = {|
  +onSubmit: {| recoveryPhrase: string |} => void,
  +onBack: void => void,
  +mnemonicValidator: string => boolean,
  +validWords: Array<string>,
  +classicTheme: boolean,
|};

@observer
export default class HardwareTransferFormPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  @observable mnemonicForm: void | ReactToolboxMobxForm;

  @action
  setMnemonicFrom(form: ReactToolboxMobxForm) {
    this.mnemonicForm = form;
  }

  submit = async () => {
    if (this.mnemonicForm == null) {
      throw new Error(`${nameof(HardwareTransferFormPage)} form not set`);
    }
    this.mnemonicForm.submit({
      onSuccess: (form) => {
        const { recoveryPhrase } = form.values();
        const payload = {
          recoveryPhrase: join(recoveryPhrase, ' '),
        };
        this.props.onSubmit(payload);
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
        step0={intl.formatMessage(globalMessages.hardwareTransferInstructions)}
        classicTheme={this.props.classicTheme}
        isDisabled={this.mnemonicForm == null || this.mnemonicForm.hasError}
      >
        <MnemonicInput
          setForm={(form) => this.setMnemonicFrom(form)}
          mnemonicValidator={this.props.mnemonicValidator}
          validWords={this.props.validWords}
          mnemonicLength={undefined}
          classicTheme={this.props.classicTheme}
        />
      </BaseTransferPage>
    );
  }
}
