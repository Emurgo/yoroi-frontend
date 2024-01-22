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
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { asGetPublicKey } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { isWalletExist } from '../../../api/ada/lib/cardanoCrypto/utils';
import { markDialogAsShown } from '../dialogs/utils';
import { ROUTES } from '../../../routes-config';
import SelectNetworkStep from '../create-wallet/SelectNetworkStep';
import environment from '../../../environment';
import { useRestoreWallet } from './hooks';
import { ampli } from '../../../../ampli/index';

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
  restoreWallet: ({|
    walletName: string,
    walletPassword: string,
    recoveryPhrase: string,
  |}) => void,
  openDialog(dialog: any): void,
  closeDialog(): void,
  isDialogOpen(dialog: any): boolean,
|};

function RestoreWalletPage(props: Props & Intl): Node {
  const { intl, stores, actions, restoreWallet, isDialogOpen, openDialog, closeDialog } = props;
  const { walletRestore, profile, router, wallets: walletsActions } = actions;
  const {
    walletRestore: walletData,
    profile: profileData,
    wallets,
    walletSettings,
    transactions,
    tokenInfoStore,
  } = stores;

  const [currentStep, setCurrentStep] = useState(getFirstRestorationStep());
  const {
    recoveryPhrase,
    duplicatedWallet,
    setRestoreWalletData,
    resetRestoreWalletData,
  } = useRestoreWallet();

  const getDuplicatedWalletData = () => {
    const publicDeriver = duplicatedWallet;

    if (!publicDeriver) return {};

    const parent = publicDeriver.getParent();
    const settingsCache = walletSettings.getConceptualWalletSettingsCache(parent);
    const withPubKey = asGetPublicKey(publicDeriver);
    const plate = withPubKey == null ? null : wallets.getPublicKeyCache(withPubKey).plate;
    const balance = transactions.getBalance(publicDeriver);

    const shouldHideBalance = profileData.shouldHideBalance;
    const updateHideBalance = () => profile.updateHideBalance.trigger();
    const tokenInfo = tokenInfoStore.tokenInfo;

    return {
      plate,
      settingsCache,
      balance,
      shouldHideBalance,
      tokenInfo,
      updateHideBalance,
    };
  };

  const manageDialogsProps = {
    isDialogOpen,
    openDialog,
    closeDialog: (dialogId: string) => {
      closeDialog();
      markDialogAsShown(dialogId);
    },
  };

  const recoveryPhraseStepProps = {
    setCurrentStep: (step) => {
      setCurrentStep(step);
      ampli.restoreWalletDetailsStepViewed();
    },
    walletData,
    isDialogOpen,
    openDialog,
    closeDialog,
    duplicatedWalletData: getDuplicatedWalletData(),
    initialRecoveryPhrase: recoveryPhrase,
  };

  function handleGoToRoute(route) {
    router.goToRoute.trigger(route);
  }

  function goToAddWalletScreen() {
    handleGoToRoute({ route: ROUTES.WALLETS.ADD });
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
            ampli.restoreWalletTypeStepViewed();
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
            resetRestoreWalletData();

            if (!environment.isDev() && !environment.isNightly())
              profile.setSelectedNetwork.trigger(networks.CardanoMainnet);

            walletRestore.setMode.trigger(mode);
            setCurrentStep(RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE);
            if (mode.length === 15) {
              ampli.restoreWalletEnterPhraseStepViewed({
                recovery_phrase_lenght: '15'
              });
            } else if (mode.length === 24) {
              ampli.restoreWalletEnterPhraseStepViewed({
                recovery_phrase_lenght: '24'
              });
            }
          }}
          goBack={() => {
            resetRestoreWalletData();
            if (!environment.isDev() && !environment.isNightly()) goToAddWalletScreen();
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
          {...recoveryPhraseStepProps}
          checkValidPhrase={phrase => {
            const isValid = walletData.isValidMnemonic(
              { mnemonic: phrase, mode: walletData.mode }
            );
            ampli.restoreWalletEnterPhraseStepStatus(
              { recovery_prhase_status: isValid }
            );
            return isValid;
          }}
          openDuplicatedWallet={lastDuplicatedWallet => {
            resetRestoreWalletData();
            walletsActions.setActiveWallet.trigger({ wallet: lastDuplicatedWallet });
            handleGoToRoute({ route: ROUTES.WALLETS.TRANSACTIONS });
          }}
          onSubmit={async enteredRecoveryPhrase => {
            const importedWallets = wallets.publicDerivers;
            const accountIndex = walletData.selectedAccount;

            const existingWallet = await isWalletExist(
              importedWallets,
              walletData.mode.type,
              enteredRecoveryPhrase,
              accountIndex,
              profileData.selectedNetwork
            );

            setRestoreWalletData({
              duplicatedWallet: existingWallet,
              recoveryPhrase: enteredRecoveryPhrase,
            });

            return existingWallet;
          }}
        />
      ),
    },
    [RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS]: {
      stepId: RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS,
      message: messages.thirdStep,
      component: (
        <AddWalletDetailsStep
          isRecovery
          prevStep={() => setCurrentStep(RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE)}
          recoveryPhrase={recoveryPhrase.split(' ')}
          selectedNetwork={profileData.selectedNetwork}
          onSubmit={(walletName: string, walletPassword: string) => {
            if (!recoveryPhrase) throw new Error('Recovery phrase must be generated first');
            if (!profileData.selectedNetwork)
              throw new Error('Network must be selected to create a wallet. Should never happen');

            restoreWallet({ walletName, walletPassword, recoveryPhrase });
            ampli.restoreWalletDetailsSubmitted();
          }}
          {...manageDialogsProps}
        />
      ),
    },
  };

  const stepperSteps = Object.keys(steps)
    .map(key => ({ stepId: steps[key].stepId, message: steps[key].message }))
    .filter(step => step.stepId !== RESTORE_WALLET_STEPS.SELECT_NETWORK);

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
        <Typography component="div" variant="h3" fontWeight={500} id="restoreTitle">
          {intl.formatMessage(messages.title)}
        </Typography>
      </Box>
      <Stepper currentStep={currentStep} setCurrentStep={setCurrentStep} steps={stepperSteps} />
      {CurrentStep}
    </Box>
  );
}

export default (injectIntl(observer(RestoreWalletPage)): ComponentType<Props>);
