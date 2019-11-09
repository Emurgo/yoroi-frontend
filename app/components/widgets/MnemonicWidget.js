// @flow
import React, { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import { Autocomplete } from 'react-polymorph/lib/components/Autocomplete';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../i18n/global-messages';
import styles from './MnemonicWidget.scss';
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

type Props = {|
  setForm: ReactToolboxMobxForm => void,
  mnemonicValidator: string => boolean,
  validWords: Array<string>,
  mnemonicLength: number,
  classicTheme: boolean,
|};

@observer
export default class MnemonicWidget extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  form: ReactToolboxMobxForm;

  constructor(props: Props, context: {| intl: $npm$ReactIntl$IntlFormat |}) {
    super(props);

    this.form = new ReactToolboxMobxForm({
      fields: {
        recoveryPhrase: {
          label: context.intl.formatMessage(messages.recoveryPhraseInputLabel),
          placeholder: this.props.classicTheme ?
            context.intl.formatMessage(messages.recoveryPhraseInputHint) : '',
          value: '',
          validators: [({ field }) => {
            const value = join(field.value, ' ');
            const wordsLeft = this.props.mnemonicLength - field.value.length;
            if (value === '') return [false, context.intl.formatMessage(globalMessages.fieldIsRequired)];
            if (wordsLeft > 0) {
              return [
                false,
                context.intl.formatMessage(globalMessages.shortRecoveryPhrase,
                  { number: wordsLeft })
              ];
            }
            return [
              this.props.mnemonicValidator(value),
              context.intl.formatMessage(messages.invalidRecoveryPhrase)
            ];
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

    this.props.setForm(this.form);
  }

  render() {
    const { intl } = this.context;
    const { form } = this;
    const {
      validWords,
      mnemonicValidator,
      mnemonicLength,
    } = this.props;
    const { recoveryPhrase } = form.values();

    const recoveryPhraseField = form.$('recoveryPhrase');

    return (
      <Autocomplete
        className={styles.inputWrapper}
        options={validWords}
        maxSelections={mnemonicLength}
        {...recoveryPhraseField.bind()}
        done={mnemonicValidator(join(recoveryPhrase, ' '))}
        error={recoveryPhraseField.error}
        maxVisibleOptions={5}
        noResultsMessage={intl.formatMessage(messages.recoveryPhraseNoResults)}
        skin={AutocompleteOwnSkin}
      />
    );
  }
}
