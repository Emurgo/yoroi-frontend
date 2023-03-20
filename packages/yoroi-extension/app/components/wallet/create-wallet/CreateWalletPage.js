// @flow
import { Node, ComponentType, useState } from 'react';
import { Box } from '@mui/material';
import { observer } from 'mobx-react';
import CreateWalletSteps from './CreateWalletSteps';
import LearnAboutRecoveryPhrase from './LearnAboutRecoveryPhrase';
import { CREATE_WALLET_SETPS, isDialogShownBefore, markDialogAsShown, TIPS_DIALOGS } from './steps';
import SaveRecoveryPhraseStep from './SaveRecoveryPhraseStep';
import VerifyRecoveryPhraseStep from './VerifyRecoveryPhraseStep';
import AddWalletDetailsStep from './AddWalletDetailsStep';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import CreateWalletPageHeader from './CreateWalletPageHeader';

type Props = {||};

function CreateWalletPage(props: Props): Node {
  const {
    genWalletRecoveryPhrase,
    createWallet,
    setSelectedNetwork,
    isDialogOpen,
    openDialog,
    closeDialog
  } = props;
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

  const manageDialogsProps = {
    isDialogOpen,
    openDialog,
    closeDialog,
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
        recoveryPhrase={recoveryPhrase}
        onSubmit={(walletName: string, walletPassword: string) => {
          if (!recoveryPhrase) throw new Error('Recovery phrase must be generated first');
          setSelectedNetwork(networks.CardanoPreprodTestnet);
          createWallet({
            walletName,
            walletPassword,
            recoveryPhrase,
          })
        }}
        {...manageDialogsProps}
      />
    )
  };

  const CurrentStep = steps[currentStep];

  return (
    <Box>
      <CreateWalletPageHeader />
      <CreateWalletSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />
      {CurrentStep}
    </Box>
  );
}


export default (observer(CreateWalletPage) : ComponentType<Props> )