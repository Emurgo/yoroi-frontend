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

const messages = defineMessages({
  title: {
    id: 'transfer.form.instructions.title.label',
    defaultMessage: '!!!Instructions',
    description: 'Label "Instructions" on the transfer mnemonic page.'
  },
  step1: {
    id: 'transfer.form.instructions.step1.text',
    defaultMessage: '!!!It will take about 1 minute to restore your balance. In the next step, you will be presented with a transaction that will move all of your funds. Please review the details of the transaction carefully. You will need to pay a standard transaction fee on the Cardano network to make the transaction.',
    description: 'Text for instructions step 1 on the transfer mnemonic page.'
  },
  recoveryPhraseInputLabel: {
    id: 'transfer.form.recovery.phrase.input.label',
    defaultMessage: '!!!Recovery phrase',
    description: 'Label for the recovery phrase input on the transfer mnemonic page.'
  },
  recoveryPhraseInputHint: {
    id: 'transfer.form.recovery.phrase.input.hint',
    defaultMessage: '!!!Enter recovery phrase',
    description: 'Hint "Enter recovery phrase" for the recovery phrase input on the transfer mnemonic page.'
  },
  recoveryPhraseNoResults: {
    id: 'transfer.form.recovery.phrase.input.noResults',
    defaultMessage: '!!!No results',
    description: '"No results" message for the recovery phrase input search results.'
  },
  invalidRecoveryPhrase: {
    id: 'transfer.form.errors.invalidRecoveryPhrase',
    defaultMessage: '!!!Invalid recovery phrase',
    description: 'Error message shown when invalid recovery phrase was entered.'
  },
  backButtonLabel: {
    id: 'transfer.form.back',
    defaultMessage: '!!!Back',
    description: 'Label for the back button on the transfer mnemonic page.'
  },
  nextButtonLabel: {
    id: 'transfer.form.next',
    defaultMessage: '!!!Next',
    description: 'Label for the next button on the transfer mnemonic page.'
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onSubmit: Function,
  onBack: Function,
  mnemonicValidator: Function,
  validWords: Array<string>,
  step0: string,
  mnemonicLength: number
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
      validationDebounceWait: 250,
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
    const { validWords, onBack, step0, mnemonicLength } = this.props;

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

    const recoveryPhraseField = form.$('recoveryPhrase');

    return (
      <div className={styles.component}>
        <BorderedBox>

          <div className={styles.body}>

            { /* Instructions for how to transfer */ }
            <div>
              <div className={styles.title}>
                {intl.formatMessage(messages.title)}
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
              error={recoveryPhraseField.error}
              maxVisibleOptions={5}
              noResultsMessage={intl.formatMessage(messages.recoveryPhraseNoResults)}
              skin={AutocompleteSkin}
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
