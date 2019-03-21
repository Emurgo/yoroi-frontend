// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
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

messages.fieldIsRequired = globalMessages.fieldIsRequired;
messages.invalidMasterKey = globalMessages.invalidMasterKey;
messages.nextButtonLabel = globalMessages.nextButtonLabel;
messages.backButtonLabel = globalMessages.backButtonLabel;
messages.step1 = globalMessages.step1;
messages.instructionTitle = globalMessages.instructionTitle;

type Props = {
  onSubmit: Function,
  onBack: Function,
  step0: string,
};

@observer
export default class TransferMasterKeyPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  form = new ReactToolboxMobxForm({
    fields: {
      masterKey: {
        label: this.context.intl.formatMessage(messages.masterKeyInputLabel),
        placeholder: this.context.intl.formatMessage(messages.masterKeyInputHint),
        value: '',
        validators: [({ field }) => {
          const value = field.value;
          if (value === '') {
            return [false, this.context.intl.formatMessage(messages.fieldIsRequired)];
          }
          if (value.length !== 192) {
            return [false, this.context.intl.formatMessage(messages.invalidMasterKey)];
          }
          if (!value.match('^[0-9a-fA-F]+$')) {
            return [false, this.context.intl.formatMessage(messages.invalidMasterKey)];
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
    const { onBack, step0 } = this.props;

    const nextButtonClasses = classnames([
      'proceedTransferButtonClasses',
      'primary',
      styles.button,
    ]);
    const backButtonClasses = classnames([
      'backTransferButtonClasses',
      'flat',
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
                {intl.formatMessage(messages.instructionTitle)}
              </div>

              <ul className={styles.instructionsList}>
                {
                  <div className={styles.text}>
                    {step0}
                    {intl.formatMessage(messages.step1)}
                    <br /><br />
                    {intl.formatMessage(messages.masterKeyRequirements)}
                  </div>
                }
              </ul>
            </div>

            <Input
              className="masterKey"
              autoComplete="off"
              {...masterKeyField.bind()}
              error={masterKeyField.error}
              skin={InputSkin}
            />

            <div className={styles.buttonsWrapper}>
              <Button
                className={nextButtonClasses}
                label={intl.formatMessage(messages.nextButtonLabel)}
                onClick={this.submit}
                skin={ButtonSkin}
              />

              <Button
                className={backButtonClasses}
                label={intl.formatMessage(messages.backButtonLabel)}
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
