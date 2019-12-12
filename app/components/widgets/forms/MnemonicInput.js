// @flow
import React, { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import { Autocomplete } from 'react-polymorph/lib/components/Autocomplete';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../../i18n/global-messages';
import styles from './MnemonicInput.scss';
import config from '../../../config';
import { AutocompleteOwnSkin } from '../../../themes/skins/AutocompleteOwnSkin';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +mnemonicValidator: string => boolean,
  +validWords: Array<string>,
  +mnemonicLength: void | number,
  +classicTheme: boolean,
|};

@observer
export default class MnemonicInput extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  form = new ReactToolboxMobxForm({
    fields: {
      recoveryPhrase: {
        label: this.context.intl.formatMessage(globalMessages.recoveryPhraseInputLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.recoveryPhraseInputHint) : '',
        value: '',
        validators: [({ field }) => {
          const value = join(field.value, ' ');
          if (value === '') return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          if (this.props.mnemonicLength != null) {
            const wordsLeft = this.props.mnemonicLength - field.value.length;
            if (wordsLeft > 0) {
              return [
                false,
                this.context.intl.formatMessage(globalMessages.shortRecoveryPhrase,
                  { number: wordsLeft })
              ];
            }
          }
          return [
            this.props.mnemonicValidator(value),
            this.context.intl.formatMessage(globalMessages.invalidRecoveryPhrase)
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

  render() {
    const { intl } = this.context;
    const { form } = this;
    const {
      validWords,
      mnemonicValidator,
      mnemonicLength,
    } = this.props;
    this.props.setForm(this.form);
    const { recoveryPhrase } = form.values();

    const recoveryPhraseField = form.$('recoveryPhrase');

    return (
      <Autocomplete
        className={styles.inputWrapper}
        options={validWords}
        maxSelections={mnemonicLength ?? config.wallets.MAX_RECOVERY_PHRASE_WORD_COUNT}
        {...recoveryPhraseField.bind()}
        done={mnemonicValidator(join(recoveryPhrase, ' '))}
        error={recoveryPhraseField.error}
        maxVisibleOptions={5}
        noResultsMessage={intl.formatMessage(globalMessages.recoveryPhraseNoResults)}
        skin={AutocompleteOwnSkin}
      />
    );
  }
}
