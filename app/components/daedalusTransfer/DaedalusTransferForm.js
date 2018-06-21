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
import LocalizableError from '../../i18n/LocalizableError';
import styles from './DaedalusTransferForm.scss';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.form.instructions.title.label',
    defaultMessage: '!!!Transfer funds from Daedalus wallet',
    description: 'Label "Transfer funds from Daedalus wallet" on the Daedalus transfer form page.'
  },
  instructions: {
    id: 'daedalusTransfer.form.instructions.description.text',
    defaultMessage: '!!!Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    description: 'Text instructions on the Daedalus transfer form page.'
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
  nextButtonLabel: {
    id: 'daedalusTransfer.form.next',
    defaultMessage: '!!!Next',
    description: 'Label for the next button on the Daedalus transfer form page.'
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onSubmit: Function,
  onCancel: Function,
  isSubmitting: boolean,
  mnemonicValidator: Function,
  error?: ?LocalizableError,
  suggestedMnemonics: Array<string>,
};

@observer
export default class DaedalusTransferForm extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

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
    const { suggestedMnemonics, error } = this.props;

    const buttonClasses = classnames([
      'primary',
      styles.nextButton,
    ]);

    const recoveryPhraseField = form.$('recoveryPhrase');

    return (
      <div className={styles.component}>
        <BorderedBox>

          <div className={styles.body}>

            <div className={styles.title}>
              {intl.formatMessage(messages.title)}
            </div>

            <div className={styles.text}>
              {intl.formatMessage(messages.instructions)}
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

            {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

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
