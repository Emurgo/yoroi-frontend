// @flow
import React, { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Autocomplete } from 'react-polymorph/lib/components/Autocomplete';
import { AutocompleteSkin } from 'react-polymorph/lib/skins/simple/AutocompleteSkin';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import BorderedBox from '../widgets/BorderedBox';
import globalMessages from '../../i18n/global-messages';
import styles from './TransferMnemonicPage.scss';
import config from '../../config';
import { AutocompleteOwnSkin } from '../../themes/skins/AutocompleteOwnSkin';

const messages = defineMessages({
  recoveryPhraseInputLabel: {
    id: 'transfer.form.recovery.phrase.input.label',
    defaultMessage: '!!!Recovery phrase',
  },
  recoveryPhraseInputHint: {
    id: 'transfer.form.recovery.phrase.input.hint',
    defaultMessage: '!!!Enter recovery phrase',
  },
  recoveryPhraseNoResults: {
    id: 'transfer.form.recovery.phrase.input.noResults',
    defaultMessage: '!!!No results',
  },
  invalidRecoveryPhrase: {
    id: 'transfer.form.errors.invalidRecoveryPhrase',
    defaultMessage: '!!!Invalid recovery phrase',
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;
messages.nextButtonLabel = globalMessages.nextButtonLabel;
messages.backButtonLabel = globalMessages.backButtonLabel;
messages.step1 = globalMessages.step1;
messages.instructionTitle = globalMessages.instructionTitle;

type Props = {
  onSubmit: Function,
  onBack: Function,
  mnemonicValidator: Function,
  validWords: Array<string>,
  step0: string,
  mnemonicLength: number,
  isClassicThemeActive: boolean
};

@observer
export default class TransferMnemonicPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  form = new ReactToolboxMobxForm({
    fields: {
      recoveryPhrase: {
        label: this.context.intl.formatMessage(messages.recoveryPhraseInputLabel),
        placeholder: this.context.intl.formatMessage(messages.recoveryPhraseInputHint),
        value: '',
        validators: [({ field }) => {
          const value = join(field.value, ' ');
          if (value === '') return [false, this.context.intl.formatMessage(messages.fieldIsRequired)];
          return [
            this.props.mnemonicValidator(value),
            this.context.intl.formatMessage(messages.invalidRecoveryPhrase)
          ];
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
    const { form } = this;
    const { validWords, onBack, step0, mnemonicValidator, mnemonicLength, isClassicThemeActive } = this.props;
    const { recoveryPhrase } = form.values();

    const nextButtonClasses = classnames([
      'proceedTransferButtonClasses',
      'primary',
      styles.button,
    ]);
    const backButtonClasses = classnames([
      'backTransferButtonClasses',
      isClassicThemeActive ? 'flat' : 'outlined',
      styles.button,
    ]);

    const recoveryPhraseField = form.$('recoveryPhrase');

    return (
      <div className={styles.component}>
        <BorderedBox isClassicThemeActive={isClassicThemeActive}>

          <div className={styles.body}>

            { /* Instructions for how to transfer */ }
            <div>
              <div className={isClassicThemeActive ? styles.titleClassic : styles.title}>
                {intl.formatMessage(messages.instructionTitle)}
              </div>

              <ul className={styles.instructionsList}>
                {
                  <div className={styles.text}>
                    {step0}
                    {intl.formatMessage(messages.step1)}
                  </div>
                }
              </ul>
            </div>

            <Autocomplete
              options={validWords}
              maxSelections={mnemonicLength}
              {...recoveryPhraseField.bind()}
              done={mnemonicValidator(join(recoveryPhrase, ' '))}
              error={recoveryPhraseField.error}
              maxVisibleOptions={5}
              noResultsMessage={intl.formatMessage(messages.recoveryPhraseNoResults)}
              skin={isClassicThemeActive ? AutocompleteSkin : AutocompleteOwnSkin}
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
