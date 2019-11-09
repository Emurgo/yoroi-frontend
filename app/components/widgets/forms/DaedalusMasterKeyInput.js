// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../../i18n/global-messages';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import { Input } from 'react-polymorph/lib/components/Input';

const messages = defineMessages({
  masterKeyInputLabel: {
    id: 'transfer.form.masterkey.input.label',
    defaultMessage: '!!!Master key',
  },
  masterKeyInputHint: {
    id: 'transfer.form.masterkey.input.hint',
    defaultMessage: '!!!Enter master key',
  },
  masterKeyRequirements: {
    id: 'transfer.form.masterkey.requirement',
    defaultMessage: '!!!Note: master keys are 192 characters and hexadecimal-encoded',
  },
});

type Props = {|
  setForm: ReactToolboxMobxForm => void,
  classicTheme: boolean,
|};

@observer
export default class DaedalusMasterKeyInput extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  form = new ReactToolboxMobxForm({
    fields: {
      masterKey: {
        label: this.context.intl.formatMessage(messages.masterKeyInputLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.masterKeyInputHint) : '',
        value: '',
        validators: [({ field }) => {
          const value = field.value;
          if (value === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          if (value.length !== 192) {
            return [false, this.context.intl.formatMessage(globalMessages.invalidMasterKey)];
          }
          if (!value.match('^[0-9a-fA-F]+$')) {
            return [false, this.context.intl.formatMessage(globalMessages.invalidMasterKey)];
          }
          return true;
        }],
      },
    },
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  render() {
    const { form } = this;
    this.props.setForm(this.form);

    const masterKeyField = form.$('masterKey');

    return (
      <Input
        className="masterKey"
        autoComplete="off"
        {...masterKeyField.bind()}
        error={masterKeyField.error}
        skin={InputOwnSkin}
      />
    );
  }
}
