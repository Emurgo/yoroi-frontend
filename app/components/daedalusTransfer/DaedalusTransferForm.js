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
import styles from './DaedalusTransferForm.scss';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.form.instructions.title.label',
    defaultMessage: 'Instructions',
    description: 'Label "Instructions" on the Daedalus transfer form page.'
  },
  instructions: {
    step1: {
      id: 'daedalusTransfer.form.instructions.step1.text',
      defaultMessage: 'Find you Daedalus mnemonics and prepare it',
      description: 'Text for instructions step 1 on the Daedalus transfer form page.'
    },
    step2: {
      id: 'daedalusTransfer.form.instructions.step2.text',
      defaultMessage: 'Enter mnemonics',
      description: 'Text for instructions step 2 on the Daedalus transfer form page.'
    },
    step3: {
      id: 'daedalusTransfer.form.instructions.step3.text',
      defaultMessage: 'Click Next button',
      description: 'Text for instructions step 3 on the Daedalus transfer form page.'
    },
    step4: {
      id: 'daedalusTransfer.form.instructions.step4.text',
      defaultMessage: 'Wait until wallet is synced',
      description: 'Text for instructions step 4 on the Daedalus transfer form page.'
    },
    step5: {
      id: 'daedalusTransfer.form.instructions.step5.text',
      defaultMessage: 'Accept "transfer funds" transaction between Daedalus and Icarus wallets.',
      description: 'Text for instructions step 5 on the Daedalus transfer form page.'
    },
  },
  recoveryPhraseInputLabel: {
    id: 'daedalusTransfer.form.recovery.phrase.input.label',
    defaultMessage: 'Recovery phrase',
    description: 'Label for the recovery phrase input on the Daedalus transfer form page.'
  },
  recoveryPhraseInputHint: {
    id: 'daedalusTransfer.form.recovery.phrase.input.hint',
    defaultMessage: 'Enter recovery phrase',
    description: 'Hint "Enter recovery phrase" for the recovery phrase input on the Daedalus transfer form page.'
  },
  recoveryPhraseNoResults: {
    id: 'daedalusTransfer.form.recovery.phrase.input.noResults',
    defaultMessage: 'No results',
    description: '"No results" message for the recovery phrase input search results.'
  },
  invalidRecoveryPhrase: {
    id: 'daedalusTransfer.form.errors.invalidRecoveryPhrase',
    defaultMessage: 'Invalid recovery phrase',
    description: 'Error message shown when invalid recovery phrase was entered.'
  },
  nextButtonLabel: {
    id: 'daedalusTransfer.form.next',
    defaultMessage: 'Next',
    description: 'Label for the next button on the Daedalus transfer form page.'
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

// FIXME: Handle submiting and error transitions
type Props = {
  onSubmit: Function,
  mnemonicValidator: Function,
  suggestedMnemonics: Array<string>,
};

@observer
export default class DaedalusTransferForm extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  // FIXME: Mnemonic validation error is not displaying in the UI
  form = new ReactToolboxMobxForm({
    fields: {
      recoveryPhrase: {
        label: this.context.intl.formatMessage(messages.recoveryPhraseInputLabel),
        placeholder: this.context.intl.formatMessage(messages.recoveryPhraseInputHint),
        value: '',
        validators: ({ field }) => {
          const value = join(field.value, ' ');
          if (value === '') return [false, this.context.intl.formatMessage(messages.fieldIsRequired)];
          return [
            this.props.mnemonicValidator(value),
            this.context.intl.formatMessage(messages.invalidRecoveryPhrase)
          ];
        },
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
    const { suggestedMnemonics } = this.props;

    const buttonClasses = classnames([
      'primary',
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
                  Object.values(messages.instructions)
                  .map(step =>
                    <li className={styles.text}>
                      {intl.formatMessage(step)}
                    </li>
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

            <Button
              className={buttonClasses}
              label={intl.formatMessage(messages.nextButtonLabel)}
              onClick={this.submit}
              skin={<SimpleButtonSkin />}
            />

          </div>

        </BorderedBox>

      </div>
    );
  }
}
