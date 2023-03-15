// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import vjf from 'mobx-react-form/lib/validators/VJF';
import validWords from 'bip39/src/wordlists/english.json';
import LocalizableError from '../../../../../i18n/LocalizableError';
import ReactToolboxMobxForm from '../../../../../utils/ReactToolboxMobxForm';
import globalMessages from '../../../../../i18n/global-messages';
import config from '../../../../../config';
import Autocomplete from '../../../../common/autocomplete/Autocomplete';
import { Box, Stack, Typography } from '@mui/material';
import styles from './EnterRecoveryPhraseStep.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.restore.dialog.title.label',
    defaultMessage: '!!!Restore wallet',
  },
  titleVerify: {
    id: 'wallet.restore.dialog.title.verify.label',
    defaultMessage: '!!!Verify Yoroi wallet',
  },
  importButtonLabel: {
    id: 'wallet.restore.dialog.restore.wallet.button.label',
    defaultMessage: '!!!Restore wallet',
  },
  verifyButtonLabel: {
    id: 'wallet.restore.dialog.verify.wallet.button.label',
    defaultMessage: '!!!Verify wallet',
  },
});

export type WalletRestoreDialogValues = {|
  recoveryPhrase: Array<string>,
|};

type Props = {|
  +onSubmit: WalletRestoreDialogValues => PossiblyAsync<void>,
  +mnemonicValidator: string => boolean,
  +numberOfMnemonics: number,
  +error?: ?LocalizableError,
  +initValues?: ?WalletRestoreDialogValues,
  onAddWord(word: string, idx: number): void,
|};

@observer
export default class RestoreRecoveryPhraseFormClass extends Component<Props> {
  static defaultProps: {|
    error: void,
    initValues: Object,
  |} = {
    error: undefined,
    initValues: {},
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  getInitRecoveryPhrase: void => Array<string> = () => {
    return (
      this.props.initValues?.recoveryPhrase ?? new Array(this.props.numberOfMnemonics).fill('')
    );
  };

  myRefs: Array<any> = [];

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        recoveryPhrase: this.getInitRecoveryPhrase().map((word, idx) => ({
          value: word,
          label: '',
        })),
      },
    },
    {
      options: {
        showErrorsOnInit: false,
        validateOnChange: true,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: { vjf: vjf() },
    }
  );

  submit: () => void = () => {
    this.form.submit({
      onSuccess: async form => {
        const { recoveryPhrase } = form.values();
        const walletData: WalletRestoreDialogValues = { recoveryPhrase: join(recoveryPhrase, ' ') };
        await this.props.onSubmit(walletData);
      },
      onError: () => {},
    });
  };

  render(): Node {
    const { intl } = this.context;
    const { error, mnemonicValidator } = this.props;
    const { form } = this;
    const { recoveryPhrase } = form.values();

    const recoveryPhraseField = form.$('recoveryPhrase');

    return (
      <Box className={styles.verifyRecoveryPhraseArea}>
        <Stack
          gap="8px"
          p="16px 14px"
          flexDirection="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="center"
        >
          {recoveryPhrase?.map((word, idx) => {
            const prevWordField =
              idx !== 0 ? form.$(`recoveryPhrase[${idx - 1}].value`).bind().value : '';
            const wordField = form.$(`recoveryPhrase[${idx}].value`);

            return (
              <Stack
                item
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
              >
                <Box
                  sx={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '120px',
                    height: '40px',
                  }}
                  variant="body1"
                  color="primary.200"
                >
                  <Typography variant="body1" color="primary.200" width="20px">
                    {idx + 1}.
                  </Typography>

                  <Autocomplete
                    inputRef={el => (this.myRefs[idx] = el)}
                    options={validWords}
                    maxSelections={1}
                    maxVisibleOptions={5}
                    autoFocus={idx === 0 && !wordField.bind().value}
                    noResultsMessage={intl.formatMessage(globalMessages.recoveryPhraseNoResults)}
                    {...wordField.bind()}
                  />
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    );
  }
}
