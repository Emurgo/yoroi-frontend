// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import type { RestoreModeType } from '../../../../../actions/common/wallet-restore-actions';
import { useState } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { Stack, Box, Typography } from '@mui/material';
import { RESTORE_WALLET_STEPS } from '../../steps';
import { PublicDeriver } from '../../../../../api/ada/lib/storage/models/PublicDeriver';
import { asGetPublicKey } from '../../../../../api/ada/lib/storage/models/PublicDeriver/traits';
import validWords from 'bip39/src/wordlists/english.json';
import StepController from '../../StepController';
import styles from './EnterRecoveryPhraseStep.scss';
import classnames from 'classnames';
import Autocomplete from '../../../../common/Autocomplete';
import globalMessages from '../../../../../i18n/global-messages';
import RestoreRecoveryPhraseForm from './RestoreRecoveryPhraseForm';

const messages = defineMessages({
  stepDescription: {
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

type Intl = {| intl: $npm$ReactIntl$IntlShape |};

type Props = {|
  walletRestore: any,
  walletData: any,
  setCurrentStep(stepId: string): void,
  checkValidPhrase(enteredPhrase: string): boolean,
  onSubmit(phrase: string): PossiblyAsync<PublicDeriver<> | typeof undefined>,
|};

function VerifyRecoveryPhraseStep(props: Props & Intl): Node {
  const [enableNext, setEnableNext] = useState(false);
  const [duplicatedWallet, setDuplicatedWallet] = useState(null);
  const { intl, setCurrentStep, walletRestore, walletData, checkValidPhrase, onSubmit } = props;
  const mode = walletData.getMode();

  function goNextStepCallback() {
    return () => setCurrentStep(RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS);
  }

  function checkMnemonic(recoveryPhrase) {
    const phrase = recoveryPhrase.map(word => word.value).join(' ');
    const isValid = checkValidPhrase(phrase);
    return isValid;
  }

  async function handleSubmit(recoveryPhrase) {
    const duplicatedWallet = await onSubmit(recoveryPhrase);
    if (!Boolean(duplicatedWallet)) setEnableNext(true);
    else setDuplicatedWallet(duplicatedWallet);
  }

  function getDuplicatedWalletData() {
    const publicDeriver = duplicatedWallet;
    if (!Boolean(publicDeriver)) {
      throw new Error(`${nameof(VerifyRecoveryPhraseStep)} no duplicated wallet`);
    }
    const parent = publicDeriver?.getParent();
    const settingsCache = this.generated.stores.walletSettings.getConceptualWalletSettingsCache(
      parent
    );
    const withPubKey = asGetPublicKey(publicDeriver);
    const plate =
      withPubKey == null ? null : this.generated.stores.wallets.getPublicKeyCache(withPubKey).plate;
    const txRequests = this.generated.stores.transactions.getTxRequests(publicDeriver);
    const balance = txRequests.requests.getBalanceRequest.result ?? null;

    return balance;
  }

  return (
    <Stack alignItems="center" justifyContent="center" className={styles.component}>
      <Stack
        direction="column"
        alignItems="left"
        justifyContent="center"
        maxWidth={mode.length === 15 ? '690px' : '816px'}
      >
        <Typography mb="16px">
          <FormattedHTMLMessage {...messages.stepDescription} />
        </Typography>

        <RestoreRecoveryPhraseForm
          numberOfMnemonics={mode.length}
          isValidMnemonic={checkMnemonic}
          onSubmit={handleSubmit}
        />

        {Boolean(duplicatedWallet) && <>TODO: Wallet duped - {getDuplicatedWalletData()}</>}

        <Box mt="10px">
          <StepController
            goNext={enableNext ? goNextStepCallback() : undefined}
            goBack={() => setCurrentStep(RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE)}
          />
        </Box>
      </Stack>
    </Stack>
  );
}

export default (injectIntl(observer(VerifyRecoveryPhraseStep)): ComponentType<Props>);
