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
    id: 'walllet.create.thirdStep.verifiedRecoveryPhrase',
    defaultMessage: '!!!The recovery phrase is verified',
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
    const { error, mnemonicValidator, numberOfMnemonics } = this.props;
    const { form } = this;
    const { recoveryPhrase } = form.values();

    const recoveryPhraseField = form.$('recoveryPhrase');
    const isValidPhrase =
      recoveryPhrase.length === numberOfMnemonics && !recoveryPhrase.some(word => !word.value);

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
                    // inputRef={el => (this.myRefs[idx] = el)}
                    options={validWords}
                    maxSelections={1}
                    maxVisibleOptions={5}
                    noResultsMessage={intl.formatMessage(globalMessages.recoveryPhraseNoResults)}
                    {...wordField.bind()}
                  />
                </Box>
              </Stack>
            );
          })}
        </Stack>

        {!isValidPhrase && (
          <>
            <Box>{error && intl.formatMessage(error)}</Box>
            <Box sx={{ width: '100px' }}>
              <Button
                variant="outlined"
                disableRipple={false}
                onClick={() => form.reset()}
                sx={{
                  border: 0,
                  width: '140px',
                  fontSize: '14px',
                  lineHeight: '15px',
                  minWidth: 0,
                }}
              >
                {intl.formatMessage(messages.clearAll)}
              </Button>
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
