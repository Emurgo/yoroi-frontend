// @flow
import React, { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Autocomplete from 'react-polymorph/lib/components/Autocomplete';
import SimpleAutocompleteSkin from 'react-polymorph/lib/skins/simple/raw/AutocompleteSkin';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import BorderedBox from '../widgets/BorderedBox';
import globalMessages from '../../i18n/global-messages';
import styles from './DaedalusTransferFormPage.scss';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.form.instructions.title.label',
    defaultMessage: '!!!Instructions',
    description: 'Label "Instructions" on the Daedalus transfer form page.'
  },
  step0: {
    id: 'daedalusTransfer.form.instructions.step0.text',
    defaultMessage: '!!!Enter the 12-word recovery phrase used to back up your Daedalus wallet to restore the balance and transfer all the funds from Daedalus to Icarus.',
    description: 'Text for instructions step 0 on the Daedalus transfer form page.'
  },
  step1: {
    id: 'daedalusTransfer.form.instructions.step1.text',
    defaultMessage: '!!!It will take about 1 minute to restore your balance. In the next step, you will be presented with a transaction that will move all of your funds from Daedalus to Icarus. Please review the details of the transaction carefully. You will need to pay a standard transaction fee on the Cardano network to make the transaction.',
    description: 'Text for instructions step 1 on the Daedalus transfer form page.'
  },
  recoveryPhraseInputLabel: {
    id: 'daedalusTransfer.form.recovery.phrase.input.label',
    defaultMessage: '!!!Recovery phrase',
    description: 'Label for the recovery phrase input on the Daedalus transfer form page.'
  },
  recoveryPhraseInputHint: {
    id: 'daedalusTransfer.form.recovery.phrase.input.hint',
    defaultMessage: '!!!Enter recovery phrase',
    description: 'Hint "Enter recovery phrase" for the recovery phrase input on the Daedalus transfer form page.'
  },
  recoveryPhraseNoResults: {
    id: 'daedalusTransfer.form.recovery.phrase.input.noResults',
    defaultMessage: '!!!No results',
    description: '"No results" message for the recovery phrase input search results.'
  },
  invalidRecoveryPhrase: {
    id: 'daedalusTransfer.form.errors.invalidRecoveryPhrase',
    defaultMessage: '!!!Invalid recovery phrase',
    description: 'Error message shown when invalid recovery phrase was entered.'
  },
  backButtonLabel: {
    id: 'daedalusTransfer.form.back',
    defaultMessage: '!!!Back',
    description: 'Label for the back button on the Daedalus transfer form page.'
  },
  nextButtonLabel: {
    id: 'daedalusTransfer.form.next',
    defaultMessage: '!!!Next',
    description: 'Label for the next button on the Daedalus transfer form page.'
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onSubmit: Function,
  onBack: Function,
  mnemonicValidator: Function,
  suggestedMnemonics: Array<string>,
};

@observer
export default class DaedalusTransferFormPage extends Component<Props> {

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
    const { suggestedMnemonics, onBack } = this.props;

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

            <div>
              <div className={styles.title}>
                {intl.formatMessage(messages.title)}
              </div>

              <ul className={styles.instructionsList}>
                {
                  Array(2).fill().map((_, idx) =>
                    <div key={`step${idx}`} className={styles.text}>
                      {intl.formatMessage({ id: messages[`step${idx}`].id })}
                    </div>
                  )
                }
              </ul>
            </div>

            <Autocomplete
              options={suggestedMnemonics}
              maxSelections={12}
              {...recoveryPhraseField.bind()}
              error={recoveryPhraseField.error}
              maxVisibleOptions={5}
              noResultsMessage={intl.formatMessage(messages.recoveryPhraseNoResults)}
              skin={<SimpleAutocompleteSkin />}
            />

            <div className={styles.buttonsWrapper}>
              <Button
                className={nextButtonClasses}
                label={intl.formatMessage(messages.nextButtonLabel)}
                onClick={this.submit}
                skin={<SimpleButtonSkin />}
              />

              <Button
                className={backButtonClasses}
                label={intl.formatMessage(messages.backButtonLabel)}
                onClick={onBack}
                skin={<SimpleButtonSkin />}
              />
            </div>

          </div>

        </BorderedBox>

      </div>
    );
  }
}
