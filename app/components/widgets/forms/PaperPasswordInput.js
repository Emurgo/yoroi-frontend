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
import { isValidPaperPassword } from '../../../utils/validations';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +classicTheme: boolean,
  +passwordMatches: string => boolean,
  +includeLengthCheck: boolean,
  +initValues?: string,

|};

@observer
export default class PaperPasswordInput extends Component<Props> {

  static defaultProps = {
    initValues: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  baseCheck: string => boolean = (password) => {
    // TODO: Should we allow 0-length paper wallet passwords?
    // Disable for now to avoid user accidentally forgetting
    // to enter his password and pressing restore
    return password.length > 0;
  }
  lengthCheck: string => boolean = (password) => {
    return !this.props.includeLengthCheck || isValidPaperPassword(password);
  }

  form = new ReactToolboxMobxForm({
    fields: {
      paperPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.paperPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.paperPasswordLabel) : '',
        value: (this.props.initValues) || '',
        validators: [({ field }) => {
          const validatePassword = p => this.props.passwordMatches(p);
          return [
            validatePassword(field.value),
            this.context.intl.formatMessage(globalMessages.invalidRepeatPassword)
          ];
        },
        ({ field }) => ([
          this.baseCheck(field.value),
          this.context.intl.formatMessage(globalMessages.fieldIsRequired)
        ]),
        ({ field }) => ([
          this.lengthCheck(field.value),
          this.context.intl.formatMessage(globalMessages.invalidPaperPassword)
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

  render() {
    const { form } = this;
    const { intl } = this.context;
    const {
      paperPassword,
    } = form.values();

    const paperPasswordField = form.$('paperPassword');

    return (
      <div>
        {intl.formatMessage(globalMessages.passwordDisclaimer)}
        <Input
          className="paperPassword"
          {...paperPasswordField.bind()}
          done={
            this.baseCheck(paperPassword) &&
            this.lengthCheck(paperPassword) &&
            this.props.passwordMatches(paperPassword)
          }
          error={paperPasswordField.error}
          skin={InputOwnSkin}
        />
      </div>
    );
  }
}
