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
import { ReactComponent as VerifiedIcon } from '../../../../../assets/images/verify-icon-green.inline.svg';
import { Box, Button, Stack, Typography } from '@mui/material';
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
  clearAll: {
    id: 'wallet.restore.clearAll',
    defaultMessage: '!!!Clear all',
  },
  verified: {
    id: 'wallet.restore.thirdStep.verifiedRecoveryPhrase',
    defaultMessage: '!!!The recovery phrase is verified',
  },
  incorrectRecoveryPhrase: {
    id: 'wallet.restore.thirdStep.incorrectRecoveryPhrase',
    defaultMessage: '!!!Incorrect recovery phrase. Please make sure you have written it correctly',
  },
});

type Props = {|
  +onSubmit: string => PossiblyAsync<void>,
  +isValidMnemonic: (Array<{| value: string, label: string |}>) => boolean,
  +numberOfMnemonics: any | 12 | 15 | 21 | 24 | 27,
  +error?: ?LocalizableError,
|};

@observer
export default class RestoreRecoveryPhraseFormClass extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  getInitRecoveryPhrase: void => Array<string> = () => {
    return new Array(this.props.numberOfMnemonics).fill('');
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
      hooks: {
        onReset: form => {
          // we update the name of the form so the fields get re-rendered on reset
          form.name = 'restore-' + Date.now();
          form.reset();
        },
      },
      name: 'restore-' + Date.now(),
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
        const phrase = recoveryPhrase.map(w => w.value);
        await this.props.onSubmit(join(phrase, ' '));
      },
      onError: () => {},
    });
  };

  render(): Node {
    const { intl } = this.context;
    const { error, isValidMnemonic, numberOfMnemonics } = this.props;
    const { form } = this;
    const { recoveryPhrase } = form.values();

    const recoveryPhraseField = form.$('recoveryPhrase');
    const allWordsEntered =
      recoveryPhrase.length === numberOfMnemonics && !recoveryPhrase.some(word => !word.value);
    const isValidPhrase = allWordsEntered && isValidMnemonic(recoveryPhrase);
    const mnemonicError = intl.formatMessage(messages.incorrectRecoveryPhrase);

    if (isValidPhrase && !form.submitted) this.submit();

    return (
      <Box className={styles.verifyRecoveryPhraseArea}>
        <Stack
          gap="8px"
          p="16px 0px"
          flexDirection="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="center"
        >
          {recoveryPhrase?.map((word, idx) => {
            const wordField = form.$(`recoveryPhrase[${idx}].value`);
            const fieldBind = wordField.bind();

            return (
              <Stack
                item
                // use the form name key to know when we reset
                key={form.name + '-word-' + idx}
              >
                <Box
                  sx={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '120px',
                    height: '40px',
                    gap: '4px',
                  }}
                  variant="body1"
                  color="primary.200"
                >
                  <Typography variant="body1" color="#7892E8" width="24px">
                    {idx + 1}.
                  </Typography>

                  <Autocomplete
                    // inputRef={el => (this.myRefs[idx] = el)}
                    options={validWords}
                    isVerified={isValidPhrase}
                    maxSelections={1}
                    maxVisibleOptions={5}
                    noResultsMessage={intl.formatMessage(globalMessages.recoveryPhraseNoResults)}
                    {...fieldBind}
                    onFocus={e => e.target.setSelectionRange(0, e.target.value?.length)}
                  />
                </Box>
              </Stack>
            );
          })}
        </Stack>

        {!isValidPhrase && (
          <>
            <Box sx={{ width: '100px' }}>
              <Button
                variant="outlined"
                onClick={form.onReset}
                sx={{
                  border: 0,
                  height: '1.5rem',
                  fontSize: '14px',
                  lineHeight: '15px',
                  padding: 0,
                  mb: '16px',
                  minWidth: 0,
                  minHeight: 0,
                  '&:hover': { border: 0 },
                }}
              >
                {intl.formatMessage(messages.clearAll)}
              </Button>
            </Box>

            <Box>
              <Typography variant="body2" color={allWordsEntered ? '#FF1351' : 'transparent'}>
                {mnemonicError}
              </Typography>
            </Box>
          </>
        )}

        {isValidPhrase && (
          <Stack gap="10px" direction="row" mt="12px" alignItems="center">
            <VerifiedIcon />
            <Typography variant="body1" fontWeight={500}>
              {intl.formatMessage(messages.verified)}
            </Typography>
          </Stack>
        )}
      </Box>
    );
  }
}
