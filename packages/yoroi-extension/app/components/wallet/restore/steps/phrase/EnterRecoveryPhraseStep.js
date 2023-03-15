// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import validWords from 'bip39/src/wordlists/english.json';
import { useState } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { Stack, Box, Typography } from '@mui/material';
import StepController from '../../StepController';
import { RESTORE_WALLET_STEPS } from '../../steps';
import styles from './EnterRecoveryPhraseStep.scss';
import classnames from 'classnames';
import { ReactComponent as VerifiedIcon } from '../../../../../assets/images/verify-icon-green.inline.svg';
import Autocomplete from '../../../../common/Autocomplete';
import globalMessages from '../../../../../i18n/global-messages';
import RestoreRecoveryPhraseForm from './RestoreRecoveryPhraseForm';

const messages: * = defineMessages({
  description: {
    id: 'wallet.create.thirdStep.description',
    defaultMessage:
      '!!!<strong>Select</strong> each word in <strong>the correct order</strong> to confirm your recovery phrase.',
  },
  incorrectOrder: {
    id: 'wallet.create.thirdStep.incorrectOrder',
    defineMessages: '!!!Incorrect order. Try again',
  },
  verified: {
    id: 'walllet.create.thirdStep.verifiedRecoveryPhrase',
    defaultMessage: '!!!The recovery phrase is verified',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  numWords: number,
  currentStep: string,
  setCurrentStep(stepId: string): void,
  checkValidPhrase(enteredPhrase: Array<string>): boolean,
|};

function VerifyRecoveryPhraseStep(props: Props & Intl): Node {
  const { intl, numWords, checkValidPhrase, setCurrentStep } = props;

  const [enteredRecoveryPhrase, setRecoveryPhrase] = useState<Array<string>>(
    new Array(numWords).fill('')
  );

  function onAddWord(word: string, idx: number): void {
    const nextWordIdx = enteredRecoveryPhrase.findIndex(w => w === null);
    if (nextWordIdx === -1) throw new Error('Entered recovery phrase words list is full');

    setRecoveryPhrase(prev => {
      const copy = [...prev];
      copy[idx] = word;
      return copy;
    });
  }

  const isValidPhrase =
    enteredRecoveryPhrase.length === numWords && checkValidPhrase(enteredRecoveryPhrase);

  function goNextStepCallback() {
    if (!isValidPhrase) return;
    return () => setCurrentStep(RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS);
  }

  return (
    <Stack alignItems="center" justifyContent="center" className={styles.component}>
      <Stack
        direction="column"
        alignItems="left"
        justifyContent="center"
        maxWidth={numWords === 15 ? '690px' : '816px'}
      >
        <Typography mb="16px">
          <FormattedHTMLMessage {...messages.description} />
        </Typography>

        <RestoreRecoveryPhraseForm
          numberOfMnemonics={numWords}
          mnemonicValidator={() => console.log('validate') ?? true}
          onSubmit={({ recoveryPhrase }) => setRecoveryPhrase(recoveryPhrase)}
          initValues={{ recoveryPhrase: enteredRecoveryPhrase }}
          onAddWord={onAddWord}
        />

        {isValidPhrase && (
          <Stack gap="10px" direction="row" mt="-24px">
            <VerifiedIcon />
            <Typography variant="body1" fontWeight={500}>
              {intl.formatMessage(messages.verified)}
            </Typography>
          </Stack>
        )}

        <Box mt="10px">
          <StepController
            goNext={goNextStepCallback()}
            goBack={() => setCurrentStep(RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE)}
          />
        </Box>
      </Stack>
    </Stack>
  );
}

export default (injectIntl(observer(VerifyRecoveryPhraseStep)): ComponentType<Props>);
