// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import type { ManageDialogsProps } from '../../../dialogs/types';
import { useState } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { Stack, Box, Typography } from '@mui/material';
import { RESTORE_WALLET_STEPS } from '../../steps';
import { PublicDeriver } from '../../../../../api/ada/lib/storage/models/PublicDeriver';
import StepController from '../../../create-wallet/StepController';
import styles from './EnterRecoveryPhraseStep.scss';
import globalMessages from '../../../../../i18n/global-messages';
import RestoreRecoveryPhraseForm from './RestoreRecoveryPhraseForm';
import DuplicatedWalletDialog from './DuplicatedWalletDialog';
import { TIPS_DIALOGS } from '../../../dialogs/constants';

const messages = defineMessages({
  description: {
    id: 'wallet.restore.thirdStep.description',
    defaultMessage:
      '!!!Add the <strong>recovery phrase</strong> you received upon your wallet creation process to <strong>restore</strong> your <strong>wallet</strong> in Yoroi.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  walletData: any,
  initialRecoveryPhrase: string,
  duplicatedWalletData: any,
  openDuplicatedWallet(duplicatedWallet: PublicDeriver<>): void,
  setCurrentStep(stepId: string): void,
  checkValidPhrase(enteredPhrase: string): boolean,
  onSubmit(phrase: string): PossiblyAsync<PublicDeriver<> | typeof undefined>,
  ...ManageDialogsProps,
|};

function VerifyRecoveryPhraseStep(props: Props & Intl): Node {
  const [enableNext, setEnableNext] = useState(false);
  const [duplicatedWallet, setDuplicatedWallet] = useState(null);
  const {
    intl,
    setCurrentStep,
    walletData,
    checkValidPhrase,
    onSubmit,
    openDuplicatedWallet,
    isDialogOpen,
    closeDialog,
    openDialog,
    duplicatedWalletData,
    initialRecoveryPhrase,
  } = props;

  const isActiveDialog = isDialogOpen(DuplicatedWalletDialog);

  const mode = walletData.mode;

  function goNextStepCallback() {
    return () => setCurrentStep(RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS);
  }

  function checkMnemonic(recoveryPhrase) {
    const phrase = recoveryPhrase.map(word => word.value).join(' ');
    const isValid = checkValidPhrase(phrase);
    return isValid;
  }

  async function handleSubmit(recoveryPhrase) {
    const submittedDuplicatedWallet = await onSubmit(recoveryPhrase);
    if (!Boolean(submittedDuplicatedWallet)) setEnableNext(true);
    else {
      setDuplicatedWallet(submittedDuplicatedWallet);
      openDialog(DuplicatedWalletDialog);
    }
  }

  const goBack = () => setCurrentStep(RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE);

  function handleClose() {
    goBack();
    closeDialog(TIPS_DIALOGS.DUPLICATED_WALLET);
  }

  return (
    <Stack alignItems="center" justifyContent="center" className={styles.component} id='enterRecoveryPhraseStepComponent'>
      <Stack
        direction="column"
        alignItems="left"
        justifyContent="center"
        maxWidth={mode.length === 15 ? '636px' : '760px'}
      >
        <Typography mb="16px">
          <FormattedHTMLMessage {...messages.description} />
        </Typography>

        <RestoreRecoveryPhraseForm
          numberOfMnemonics={mode.length}
          isValidMnemonic={checkMnemonic}
          onSubmit={handleSubmit}
          initialRecoveryPhrase={initialRecoveryPhrase}
        />

        <Box mt="10px">
          <StepController
            actions={[
              {
                label: intl.formatMessage(globalMessages.backButtonLabel),
                disabled: false,
                onClick: goBack,
                type: 'secondary',
              },
              {
                label: intl.formatMessage(globalMessages.nextButtonLabel),
                disabled: !enableNext,
                onClick: goNextStepCallback(),
                type: 'primary',
              },
            ]}
          />
        </Box>
      </Stack>
      <DuplicatedWalletDialog
        duplicatedWalletData={duplicatedWalletData}
        open={isActiveDialog}
        onClose={handleClose}
        // $FlowFixMe[incompatible-call]
        onNext={() => openDuplicatedWallet(duplicatedWallet)}
      />
    </Stack>
  );
}

export default (injectIntl(observer(VerifyRecoveryPhraseStep)): ComponentType<Props>);
