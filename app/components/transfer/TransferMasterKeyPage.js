// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { InputOwnSkin } from '../../themes/skins/InputOwnSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import BorderedBox from '../widgets/BorderedBox';
import globalMessages from '../../i18n/global-messages';
import styles from './TransferMasterKeyPage.scss';
import config from '../../config';

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
  onSubmit: Function,
  onBack: Function,
  step0: string,
  classicTheme: boolean,
|};

@observer
export default class TransferMasterKeyPage extends Component<Props> {

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

  submit = () => {
    this.form.submit({
      onSuccess: (form) => {
        const { masterKey } = form.values();
        const payload = {
          masterKey,
        };
        this.props.onSubmit(payload);
      },
      onError: () => {}
    });
  };

  render() {
    const { intl } = this.context;
    const { form } = this;
    const { onBack, step0, classicTheme } = this.props;

    const nextButtonClasses = classnames([
      'proceedTransferButtonClasses',
      'primary',
      styles.button,
    ]);
    const backButtonClasses = classnames([
      'backTransferButtonClasses',
      classicTheme ? 'flat' : 'outlined',
      styles.button,
    ]);

    const masterKeyField = form.$('masterKey');

    return (
      <div className={styles.component}>
        <BorderedBox>

          <div className={styles.body}>

            { /* Instructions for how to transfer */ }
            <div>
              <div className={styles.title}>
                {intl.formatMessage(globalMessages.instructionTitle)}
              </div>

              <ul className={styles.instructionsList}>
                <div className={styles.text}>
                  {step0}
                  {intl.formatMessage(globalMessages.step1)}
                  <br /><br />
                  {intl.formatMessage(messages.masterKeyRequirements)}
                </div>
              </ul>
            </div>

            <Input
              className="masterKey"
              autoComplete="off"
              {...masterKeyField.bind()}
              error={masterKeyField.error}
              skin={InputOwnSkin}
            />

            <div className={styles.buttonsWrapper}>
              <Button
                className={nextButtonClasses}
                label={intl.formatMessage(globalMessages.nextButtonLabel)}
                onClick={this.submit}
                skin={ButtonSkin}
              />

              <Button
                className={backButtonClasses}
                label={intl.formatMessage(globalMessages.backButtonLabel)}
                onClick={onBack}
                skin={ButtonSkin}
              />
            </div>

          </div>

        </BorderedBox>

      </div>
    );
  }
}
