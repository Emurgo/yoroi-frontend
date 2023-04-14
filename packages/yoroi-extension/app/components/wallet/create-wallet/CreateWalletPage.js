// @flow
import { useState } from 'react';
import type { Node, ComponentType } from 'react';
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
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  genWalletRecoveryPhrase: void => Promise<Array<string>>,
  createWallet: ({|
    walletName: string,
    walletPassword: string,
    recoveryPhrase: Array<string>,
  |}) => void,
  selectedNetwork: $ReadOnly<NetworkRow>,
  setSelectedNetwork: (params: void | $ReadOnly<NetworkRow>) => void,
  openDialog(dialog: any): void,
  closeDialog(): void,
  isDialogOpen(dialog: any): boolean,
  goToRoute(route: string): void,
|};

export type ManageDialogsProps = {|
  openDialog(dialog: any): void,
  closeDialog(dialogId: string): void,
  isDialogOpen(dialog: any): boolean,
|};

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
  const [isRecoveryPhraseEntered, markRecoveryPhraseAsEntered] = useState<boolean>(false);

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
        goBack={() => goToRoute(ROUTES.WALLETS.ADD)}
      />
    ),
    [CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE]: (
      <LearnAboutRecoveryPhrase
        nextStep={() => {
          setCurrentStep(CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE);
          if (recoveryPhrase === null) {
            genWalletRecoveryPhrase()
              .then(setRecoveryPhrase)
              .catch(err => {
                // Todo: add proper error handling
                // eslint-disable-next-line no-console
                console.error(`genWalletRecoveryPhrase:: ${err}`);
              });
          }
        }}
        prevStep={() => {
          if (environment.isProduction()) {
            return goToRoute(ROUTES.WALLETS.ADD);
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
      <VerifyRecoveryPhraseStep
        recoveryPhrase={recoveryPhrase}
        prevStep={() => setCurrentStep(CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE)}
        nextStep={() => {
          markRecoveryPhraseAsEntered(true);
          setCurrentStep(CREATE_WALLET_SETPS.ADD_WALLET_DETAILS);
        }}
        isRecoveryPhraseEntered={isRecoveryPhraseEntered}
      />
    ),
    [CREATE_WALLET_SETPS.ADD_WALLET_DETAILS]: (
      <AddWalletDetailsStep
        isRecoveryPhraseEntered={isRecoveryPhraseEntered}
        recoveryPhrase={recoveryPhrase}
        selectedNetwork={selectedNetwork}
        prevStep={() => setCurrentStep(CREATE_WALLET_SETPS.VERIFY_RECOVERY_PHRASE)}
        onSubmit={(walletName: string, walletPassword: string) => {
          if (!recoveryPhrase) throw new Error('Recovery phrase must be generated first');
          if (!environment.isDev() && !environment.isNightly()) {
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
