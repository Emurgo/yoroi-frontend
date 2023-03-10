// @flow
import { Node, ComponentType, useState } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg'
import CreateWalletSteps from './CreateWalletSteps';
import LearnAboutRecoveryPhrase from './LearnAboutRecoveryPhrase';
import { CREATE_WALLET_SETPS, isDialogShownBefore, markDialogAsShown, TIPS_DIALOGS } from './steps';
import SaveRecoveryPhraseStep from './SaveRecoveryPhraseStep';
import VerifyRecoveryPhraseStep from './VerifyRecoveryPhraseStep';
import AddWalletDetailsStep from './AddWalletDetailsStep';

const messages: * = defineMessages({
  title: {
    id: 'wallet.create.page.title',
    defaultMessage: '!!!Create a Wallet',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {||};

function CreateWalletPage(props: Props & Intl): Node {
  const { intl, genWalletRecoveryPhrase } = props;
  const [currentStep, setCurrentStep] = useState(CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE);
  const [recoveryPhrase, setRecoveryPhrase] = useState(null);
  const [dialogs, setDialogs] = useState({
    [TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE]:
      !isDialogShownBefore(TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE),
    [TIPS_DIALOGS.SAVE_RECOVERY_PHRASE]: !isDialogShownBefore(TIPS_DIALOGS.SAVE_RECOVERY_PHRASE),
    [TIPS_DIALOGS.WALLET_NAME_AND_PASSWORD]:
      !isDialogShownBefore(TIPS_DIALOGS.WALLET_NAME_AND_PASSWORD),
  });

  function showDialog(dialogId: string): void {
    setDialogs(prev => ({ ...prev, [dialogId]: true }));
  };

  function hideDialog(dialogId: string): void {
    markDialogAsShown(dialogId);
    setDialogs(prev => ({ ...prev, [dialogId]: false }));
  };

  const steps = {
    [CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE]: (
      <LearnAboutRecoveryPhrase
        shouldShowDialog={dialogs.LEARN_ABOUT_RECOVER_PHRASE}
        hideDialog={() => hideDialog(TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE)}
        showDialog={() => showDialog(TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE)}
        onNext={async () => {
          setCurrentStep(CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE);
          if (recoveryPhrase !== null) return;
          const walletRecoveryPhrase = await genWalletRecoveryPhrase();
          setRecoveryPhrase(walletRecoveryPhrase);
        }}
      />
    ),
    [CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE]: (
      <SaveRecoveryPhraseStep
        shouldShowDialog={dialogs.SAVE_RECOVERY_PHRASE}
        hideDialog={() => hideDialog(TIPS_DIALOGS.SAVE_RECOVERY_PHRASE)}
        showDialog={() => showDialog(TIPS_DIALOGS.SAVE_RECOVERY_PHRASE)}
        setCurrentStep={setCurrentStep}
        recoveryPhrase={recoveryPhrase}
      />
    ),
    [CREATE_WALLET_SETPS.VERIFY_RECOVERY_PHRASE]: (
      <VerifyRecoveryPhraseStep
        recoveryPhrase={recoveryPhrase}
        setCurrentStep={setCurrentStep}
      />
    ),
    [CREATE_WALLET_SETPS.ADD_WALLET_DETAILS]: (
      <AddWalletDetailsStep
        shouldShowDialog={dialogs.WALLET_NAME_AND_PASSWORD}
        hideDialog={() => hideDialog(TIPS_DIALOGS.WALLET_NAME_AND_PASSWORD)}
        showDialog={() => showDialog(TIPS_DIALOGS.WALLET_NAME_AND_PASSWORD)}
        setCurrentStep={setCurrentStep}
      />
    )
  };

  const CurrentStep = steps[currentStep];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ width: '56px', height: '48px', mb: '38px' }}>
          <img src={YoroiLogo} alt="Yoroi" title="Yoroi" />
        </Box>
        <Typography variant='h3'>{intl.formatMessage(messages.title)}</Typography>
      </Box>
      <CreateWalletSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />
      {CurrentStep}
    </Box>
  );
}


export default (injectIntl(observer(CreateWalletPage)) : ComponentType<Props> )