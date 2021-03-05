// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../../i18n/global-messages';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +classicTheme: boolean,
  +disabled: boolean,
  +pinMatches: string => boolean,
  +fieldName: string,
  +validCheck: string => boolean,
  +placeholder: string,
  +onChange?: string => void,
  +allowEmptyInput: boolean,
  +initValues?: string,
  +disclaimer?: Node,
  +done?: boolean,
|};

@observer
export default class PinInput extends Component<Props> {

  static defaultProps: {|
    initValues: void,
    disclaimer: void,
    onChange: void,
    done: void,
  |} = {
    initValues: undefined,
    disclaimer: undefined,
    onChange: undefined,
    done: undefined,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      [this.props.fieldName]: {
        onChange: this.props.onChange,
        label: this.props.placeholder,
        placeholder: this.props.classicTheme
          ? this.props.placeholder
          : '',
        value: (this.props.initValues) || '',
        validators: [({ field }) => {
          return [
            this.props.pinMatches(field.value),
            this.context.intl.formatMessage(globalMessages.pinDoesNotMatch)
          ];
        },
        ({ field }) => ([
          this.props.allowEmptyInput || field.value.length >= 0,
          this.context.intl.formatMessage(globalMessages.fieldIsRequired)
        ]),
        ({ field }) => ([
          this.props.validCheck(field.value),
          this.context.intl.formatMessage(globalMessages.invalidPin)
        ]),
        ],
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

  componentDidMount() {
    this.props.setForm(this.form);
  }

  render(): Node {
    const { form } = this;

    const pinField = form.$(this.props.fieldName);

    return (
      <div>
        {this.props.disclaimer}
        <Input
          className={this.props.fieldName}
          {...pinField.bind()}
          disabled={this.props.disabled}
          error={pinField.error}
          skin={InputOwnSkin}
          done={this.props.done}
        />
      </div>
    );
  }
}
