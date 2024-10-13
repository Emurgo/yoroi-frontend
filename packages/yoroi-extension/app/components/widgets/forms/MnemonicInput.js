// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../../i18n/global-messages';
import config from '../../../config';
import Autocomplete from '../../common/Autocomplete';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +setForm: ReactToolboxMobxForm => void,
  +mnemonicValidator: string => boolean,
  +validWords: Array<string>,
  +mnemonicLength: void | number,
|};

@observer
export default class MnemonicInput extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      recoveryPhrase: {
        label: this.context.intl.formatMessage(globalMessages.recoveryPhraseInputLabel),
        placeholder: '',
        value: [],
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

  componentDidMount(): void {
    this.props.setForm(this.form);
  }

  render(): Node {
    const { intl } = this.context;
    const { form } = this;
    const {
      validWords,
      mnemonicLength,
    } = this.props;

    const recoveryPhraseField = form.$('recoveryPhrase');

    return (
      <Autocomplete
        options={validWords}
        maxSelections={mnemonicLength ?? config.wallets.MAX_RECOVERY_PHRASE_WORD_COUNT}
        {...recoveryPhraseField.bind()}
        done={recoveryPhraseField.isValid}
        error={recoveryPhraseField.error}
        maxVisibleOptions={5}
        noResultsMessage={intl.formatMessage(globalMessages.recoveryPhraseNoResults)}
        chipProps={{ sx: { bgcolor: ' #f0f3f5' } }}
      />
    );
  }
}
