// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../../i18n/global-messages';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import { Input } from 'react-polymorph/lib/components/Input';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +classicTheme: boolean,
  +initValues?: string,
  +isSubmitting: boolean,
|};

@observer
export default class SpendingPasswordInput extends Component<Props> {

  static defaultProps = {
    initValues: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  form = new ReactToolboxMobxForm({
    fields: {
      walletPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.walletPasswordFieldPlaceholder) : '',
        value: (this.props.initValues) || '',
        validators: [({ field }) => {
          if (field.value === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          return [true];
        }],
      },
    }
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  componentDidMount() {
    this.props.setForm(this.form);
  }

  render() {
    const { form } = this;

    const walletPasswordField = form.$('walletPassword');

    // note: no "done" property since we are strict on setting password but loose on validation
    // also "done" tricks into thinking the password is correct instead of just a length check
    return (
      <Input
        type="password"
        {...walletPasswordField.bind()}
        disabled={this.props.isSubmitting}
        error={walletPasswordField.error}
        skin={InputOwnSkin}
      />
    );
  }
}
