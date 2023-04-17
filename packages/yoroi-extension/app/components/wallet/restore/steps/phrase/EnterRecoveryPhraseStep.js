// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import type { RestoreModeType } from '../../../../../actions/common/wallet-restore-actions';
import type { ManageDialogsProps } from '../../../dialogs/types';
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
import { truncateToken } from '../../../../../utils/formatters';
import { getTokenName } from '../../../../../stores/stateless/tokenHelpers';
import { calculateAndFormatValue } from '../../../../../utils/unit-of-account';
import { hiddenAmount } from '../../../../../utils/strings';
import { MultiToken } from '../../../../../api/common/lib/MultiToken';
import DuplicatedWalletDialog from './DuplicatedWalletDialog';
import { TIPS_DIALOGS } from '../../../dialogs/constants';
import { ROUTES } from '../../../../../routes-config';

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
    const duplicatedWallet = await onSubmit(recoveryPhrase);
    if (!Boolean(duplicatedWallet)) setEnableNext(true);
    else {
      setDuplicatedWallet(duplicatedWallet);
      openDialog(DuplicatedWalletDialog);
    }
  }

  const goBack = () => setCurrentStep(RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE);

  function handleClose() {
    goBack();
    closeDialog(TIPS_DIALOGS.DUPLICATED_WALLET);
  }

  return (
    <Stack alignItems="center" justifyContent="center" className={styles.component}>
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
          <StepController goNext={enableNext ? goNextStepCallback() : undefined} goBack={goBack} />
        </Box>
      </Stack>
      <DuplicatedWalletDialog
        duplicatedWalletData={null}
        open={isActiveDialog}
        onClose={handleClose}
        // $FlowFixMe incompatible-call
        onNext={() => openDuplicatedWallet(duplicatedWallet)}
      />
    </Stack>
  );
}

export default (injectIntl(observer(VerifyRecoveryPhraseStep)): ComponentType<Props>);
