// @flow
import { Node, ComponentType, useState } from 'react';
import { Box } from '@mui/material';
import { observer } from 'mobx-react';
import CreateWalletSteps from './CreateWalletSteps';
import LearnAboutRecoveryPhrase from './LearnAboutRecoveryPhrase';
import { CREATE_WALLET_SETPS, getFirstStep, markDialogAsShown } from './steps';
import SaveRecoveryPhraseStep from './SaveRecoveryPhraseStep';
import VerifyRecoveryPhraseStep from './VerifyRecoveryPhraseStep';
import AddWalletDetailsStep from './AddWalletDetailsStep';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import CreateWalletPageHeader from './CreateWalletPageHeader';
import SelectNetworkStep from './SelectNetworkStep';
import environment from '../../../environment';
import { ROUTES } from '../../../routes-config';

type Props = {||};

function CreateWalletPage(props: Props): Node {
  const {
    genWalletRecoveryPhrase,
    createWallet,
    setSelectedNetwork,
    selectedNetwork,
    isDialogOpen,
    openDialog,
    closeDialog,
    goToRoute,
  } = props;
  const [currentStep, setCurrentStep] = useState(getFirstStep());
  const [recoveryPhrase, setRecoveryPhrase] = useState(null);

  const manageDialogsProps = {
    isDialogOpen,
    openDialog,
    closeDialog: (dialogId: string) => {
      closeDialog();
      markDialogAsShown(dialogId);
    },
  };

  const steps = {
    [CREATE_WALLET_SETPS.SELECT_NETWORK]: (
      <SelectNetworkStep
        onSelect={network => {
          setSelectedNetwork(network);
          setCurrentStep(CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE);
        }}
        goBack={() => goToRoute(ROUTES.WALLETS.ROOT)}
      />
    ),
    [CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE]: (
      <LearnAboutRecoveryPhrase
        nextStep={async () => {
          setCurrentStep(CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE);
          if (recoveryPhrase !== null) return;
          const walletRecoveryPhrase = await genWalletRecoveryPhrase();
          setRecoveryPhrase(walletRecoveryPhrase);
        }}
        prevStep={() => {
          if (environment.isProduction()) {
            return goToRoute(ROUTES.WALLETS.ROOT);
          }
          setCurrentStep(CREATE_WALLET_SETPS.SELECT_NETWORK);
        }}
        {...manageDialogsProps}
      />
    ),
    [CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE]: (
      <SaveRecoveryPhraseStep
        setCurrentStep={setCurrentStep}
        recoveryPhrase={recoveryPhrase}
        {...manageDialogsProps}
      />
    ),
    [CREATE_WALLET_SETPS.VERIFY_RECOVERY_PHRASE]: (
      <VerifyRecoveryPhraseStep recoveryPhrase={recoveryPhrase} setCurrentStep={setCurrentStep} />
    ),
    [CREATE_WALLET_SETPS.ADD_WALLET_DETAILS]: (
      <AddWalletDetailsStep
        setCurrentStep={setCurrentStep}
        recoveryPhrase={recoveryPhrase}
        selectedNetwork={selectedNetwork}
        onSubmit={(walletName: string, walletPassword: string) => {
          if (!recoveryPhrase) throw new Error('Recovery phrase must be generated first');
          if (environment.isProduction()) {
            setSelectedNetwork(networks.CardanoMainnet);
          }

          if (!selectedNetwork)
            throw new Error('Network must be selected to create a wallet. Should never happen');

          createWallet({
            walletName,
            walletPassword,
            recoveryPhrase,
          });
        }}
        {...manageDialogsProps}
      />
    ),
  };

  const CurrentStep = steps[currentStep];
  if (currentStep === CREATE_WALLET_SETPS.SELECT_NETWORK) return CurrentStep;

  return (
    <Box>
      <CreateWalletPageHeader />
      <CreateWalletSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />
      {CurrentStep}
    </Box>
  );
}

export default (observer(CreateWalletPage): ComponentType<Props>);
