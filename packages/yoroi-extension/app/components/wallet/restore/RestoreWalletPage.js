// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { RESTORE_WALLET_STEPS, getFirstRestorationStep } from './steps';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg';
import SelectWalletTypeStep from './steps/type/SelectWalletTypeStep';
import Stepper from '../../common/stepper/Stepper';
import EnterRecoveryPhraseStep from './steps/phrase/EnterRecoveryPhraseStep';
import AddWalletDetailsStep from '../create-wallet/AddWalletDetailsStep';
import { RestoreSteps } from '../../../stores/toplevel/WalletRestoreStore';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { useRestoreWallet } from './hooks';
import { isWalletExist } from '../../../api/ada/lib/cardanoCrypto/utils';
import { markDialogAsShown } from '../dialogs/utils';
import { ROUTES } from '../../../routes-config';
import SelectNetworkStep from '../create-wallet/SelectNetworkStep';
import environment from '../../../environment';

const messages: * = defineMessages({
  title: {
    id: 'wallet.restore.title',
    defaultMessage: '!!!Restore existing wallet',
  },
  firstStep: {
    id: 'wallet.restore.firstStep',
    defaultMessage: '!!!Select wallet type',
  },
  secondStep: {
    id: 'wallet.restore.secondStep',
    defaultMessage: '!!!Enter recovery phrase',
  },
  thirdStep: {
    id: 'wallet.restore.thirdStep',
    defaultMessage: '!!!Add wallet details',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  stores: any,
  actions: any,
  createWallet: ({|
    walletName: string,
    walletPassword: string,
    recoveryPhrase: Array<string>,
  |}) => void,
  openDialog(dialog: any): void,
  closeDialog(): void,
  isDialogOpen(dialog: any): boolean,
|};

function RestoreWalletPage(props: Props & Intl): Node {
  const { intl, stores, actions, createWallet, isDialogOpen, openDialog, closeDialog } = props;
  const { walletRestore, profile, router } = actions;
  const { walletRestore: walletData, profile: profileData, wallets } = stores;

  const [currentStep, setCurrentStep] = useState(getFirstRestorationStep());

  const { recoveryPhrase, setRestoreWalletData } = useRestoreWallet();

  const manageDialogsProps = {
    isDialogOpen,
    openDialog,
    closeDialog: (dialogId: string) => {
      closeDialog();
      markDialogAsShown(dialogId);
    },
  };

  function goToAddWalletScreen() {
    router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  }

  const steps = {
    [RESTORE_WALLET_STEPS.SELECT_NETWORK]: {
      stepId: RESTORE_WALLET_STEPS.SELECT_NETWORK,
      message: messages.firstStep,
      component: (
        <SelectNetworkStep
          onSelect={network => {
            profile.setSelectedNetwork.trigger(network);
            setCurrentStep(RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE);
          }}
          goBack={goToAddWalletScreen}
        />
      ),
    },
    [RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE]: {
      stepId: RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE,
      message: messages.firstStep,
      component: (
        <SelectWalletTypeStep
          onNext={mode => {
            if (environment.isProduction())
              profile.setSelectedNetwork.trigger(networks.CardanoMainnet);

            walletRestore.setMode.trigger(mode);
            setCurrentStep(RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE);
          }}
          goBack={() => {
            if (environment.isProduction()) goToAddWalletScreen();
            else setCurrentStep(RESTORE_WALLET_STEPS.SELECT_NETWORK);
          }}
        />
      ),
    },
    [RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE]: {
      stepId: RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE,
      message: messages.secondStep,
      component: (
        <EnterRecoveryPhraseStep
          setCurrentStep={setCurrentStep}
          walletRestore={walletRestore}
          walletData={walletData}
          checkValidPhrase={phrase =>
            walletData.isValidMnemonic({ mnemonic: phrase, mode: walletData.getMode() })
          }
          onSubmit={async recoveryPhrase => {
            const importedWallets = wallets.publicDerivers;
            const accountIndex = walletData.selectedAccount;
            console.log('🚀 > recoveryPhrase:', recoveryPhrase);

            const duplicatedWallet = await isWalletExist(
              importedWallets,
              walletData.getMode().type,
              recoveryPhrase,
              accountIndex,
              profileData.selectedNetwork
            );

            console.log('🚀 > duplicatedWallet:', duplicatedWallet);

            setRestoreWalletData({ isDuplicated: Boolean(duplicatedWallet), recoveryPhrase });

            return duplicatedWallet;
          }}
        />
      ),
    },
    [RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS]: {
      stepId: RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS,
      message: messages.thirdStep,
      component: (
        <AddWalletDetailsStep
          prevStep={() => setCurrentStep(RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE)}
          recoveryPhrase={recoveryPhrase.split(' ')}
          selectedNetwork={profileData.selectedNetwork}
          isRecovery={true}
          onSubmit={(walletName: string, walletPassword: string) => {
            if (!recoveryPhrase) throw new Error('Recovery phrase must be generated first');
            if (!profileData.selectedNetwork)
              throw new Error('Network must be selected to create a wallet. Should never happen');

            createWallet({ walletName, walletPassword, recoveryPhrase: recoveryPhrase.split(' ') });
          }}
          {...manageDialogsProps}
        />
      ),
    },
  };

  const CurrentStep = steps[currentStep].component;

  if (currentStep === RESTORE_WALLET_STEPS.SELECT_NETWORK) return CurrentStep;

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
        <Typography variant="h3">{intl.formatMessage(messages.title)}</Typography>
      </Box>
      <Stepper
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        steps={Object.values(steps).slice(1)}
      />
      {CurrentStep}
    </Box>
  );
}

export default (injectIntl(observer(RestoreWalletPage)): ComponentType<Props>);
