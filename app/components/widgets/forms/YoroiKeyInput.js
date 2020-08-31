// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../../i18n/global-messages';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import isHexadecimal from 'validator/lib/isHexadecimal';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +validLengths: Array<number>,
  +onUpdate: string => void,
  +classicTheme: boolean,
|};

@observer
export default class YoroiKeyInput extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      key: {
        label: this.context.intl.formatMessage(globalMessages.keyLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.keyLabel) : '',
        value: '',
        type: 'password',
        validators: [({ field }) => {
          const value = field.value;
          if (value === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          if (!isHexadecimal(value)) {
            return [false, this.context.intl.formatMessage(globalMessages.invalidMasterKey)];
          }
          if (this.props.validLengths.find(validLength => validLength === value.length)) {
            this.props.onUpdate(value);
            return [true];
          }
          return [
            false,
            this.context.intl.formatMessage(globalMessages.invalidKeyLength2Label, {
              // add spacing around , to avoid it looking like a decimal separator
              lengths: `[${this.props.validLengths.join(' , ')}]`,
            })
          ];
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

  componentDidMount(): void {
    this.props.setForm(this.form);
  }

  render(): Node {
    const { form } = this;

    const keyField = form.$('key');

    return (
      <Input
        className="key"
        autoComplete="off"
        {...keyField.bind()}
        error={keyField.error}
        skin={InputOwnSkin}
        done={keyField.isValid}
      />
    );
  }
}
