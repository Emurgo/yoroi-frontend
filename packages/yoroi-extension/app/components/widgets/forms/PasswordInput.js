// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../../i18n/global-messages';
import config from '../../../config';
import TextField from '../../common/TextField';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, Typography } from '@mui/material';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +disabled: boolean,
  +passwordMatches: string => boolean,
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
export default class PasswordInput extends Component<Props> {

  static defaultProps: {|
    initValues: void,
    disclaimer: void,
    onChange: void,
    done: void,
  |} = {
    initValues: undefined,
    disclaimer: undefined,
    onChange: undefined,
    // note: no "done" by default since we are strict on setting password but loose on validation
    // also "done" tricks into thinking the password is correct instead of just a length check
    done: undefined,
  };

  static contextType:any = IntlContext;
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      [this.props.fieldName]: {
        type: 'password',
        onChange: this.props.onChange,
        label: this.props.placeholder,
        placeholder: '',
        value: (this.props.initValues) || '',
        validators: [({ field }) => {
          return [
            this.props.passwordMatches(field.value),
            this.context.formatMessage(globalMessages.invalidRepeatPassword)
          ];
        },
        ({ field }) => ([
          this.props.allowEmptyInput || field.value.length >= 0,
          this.context.formatMessage(globalMessages.fieldIsRequired)
        ]),
        ({ field }) => ([
          this.props.validCheck(field.value),
          this.context.formatMessage(globalMessages.invalidWalletPassword)
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

    const passwordField = form.$(this.props.fieldName);

    return (
      <Box>
        <Typography variant="body1" color="ds.text_gray_medium">
          {this.props.disclaimer}
        </Typography>
        <TextField
          className={this.props.fieldName}
          {...passwordField.bind()}
          disabled={this.props.disabled}
          error={passwordField.error}
          done={this.props.done}
        />
      </Box>
    );
  }
}
