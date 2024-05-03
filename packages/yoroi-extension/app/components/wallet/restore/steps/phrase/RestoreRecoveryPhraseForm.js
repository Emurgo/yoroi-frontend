// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import vjf from 'mobx-react-form/lib/validators/VJF';
import validWords from 'bip39/src/wordlists/english.json';
import LocalizableError from '../../../../../i18n/LocalizableError';
import ReactToolboxMobxForm from '../../../../../utils/ReactToolboxMobxForm';
import globalMessages from '../../../../../i18n/global-messages';
import config from '../../../../../config';
import Autocomplete from '../../../../common/autocomplete/Autocomplete';
import { ReactComponent as VerifiedIcon } from '../../../../../assets/images/verify-icon-green.inline.svg';
import { Box, Button, Fade, Stack, Typography } from '@mui/material';
import styles from './EnterRecoveryPhraseStep.scss';
import environment from '../../../../../environment';

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
  +isValidMnemonic: (
    Array<{|
      value: string,
      label: string,
    |}>
  ) => boolean,
  +numberOfMnemonics: any | 12 | 15 | 21 | 24 | 27,
  +error?: ?LocalizableError,
  +initialRecoveryPhrase?: string,
|};

type State = {|
  mounted: boolean,
|};

@observer
export default class RestoreRecoveryPhraseForm extends Component<Props, State> {
  static defaultProps: {| error: void, initialRecoveryPhrase: string |} = {
    error: undefined,
    initialRecoveryPhrase: '',
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    mounted: false,
  };

  getInitRecoveryPhrase: void => Array<string> = () => {
    return this.props.initialRecoveryPhrase
      ? this.props.initialRecoveryPhrase.split(' ')
      : new Array(this.props.numberOfMnemonics).fill('');
  };

  inputRefs: Array<any> = [];

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        recoveryPhrase: this.getInitRecoveryPhrase().map((word, _) => ({
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

  //! hack to get the refs
  componentDidMount() {
    this.setState({ mounted: true });
    if (environment.isDev()) console.log(this.state.mounted);
  }

  render(): Node {
    const { intl } = this.context;
    const { isValidMnemonic, numberOfMnemonics } = this.props;
    const { form } = this;
    const { recoveryPhrase } = form.values();

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

            const isFirstField = idx === 0;
            const isLastField = idx === recoveryPhrase.length - 1;

            return (
              <Stack
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
                >
                  <Typography component="div" variant="body1" color="ds.primary_c400" width="24px">
                    {idx + 1}.
                  </Typography>

                  <Autocomplete
                    inputRef={ref => {
                      this.inputRefs[idx] = ref;
                    }}
                    prevFieldRef={!isFirstField ? this.inputRefs[idx - 1] : null}
                    nextFieldRef={!isLastField ? this.inputRefs[idx + 1] : null}
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
            <Fade in={!isValidPhrase}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={form.onReset}
                disabled={!recoveryPhrase.some(word => Boolean(word.value))}
                sx={{
                  border: 0,
                  height: '32px',
                  fontSize: '14px',
                  lineHeight: '15px',
                  padding: '0px',
                  mb: '8px',
                  ml: '-6px',
                  minWidth: 0,
                  minHeight: 0,
                  '&:hover': { border: 0 },
                  '&.Mui-disabled': { border: 0 },
                }}
                id="clearAllButton"
              >
                {intl.formatMessage(messages.clearAll)}
              </Button>
            </Fade>

            <Fade in={!isValidPhrase && allWordsEntered}>
              <Typography component="div" variant="body2" color="#FF1351" id="mnemonicErrorText">
                {mnemonicError}
              </Typography>
            </Fade>
          </>
        )}

        <Fade in={isValidPhrase}>
          <Stack gap="10px" direction="row" mt="12px" alignItems="center">
            <VerifiedIcon />
            <Typography component="div" variant="body1" fontWeight={500} id="validPhraseMessage">
              {intl.formatMessage(messages.verified)}
            </Typography>
          </Stack>
        </Fade>
      </Box>
    );
  }
}
