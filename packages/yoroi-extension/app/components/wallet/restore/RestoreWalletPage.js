// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Box, Typography, styled } from '@mui/material';
import { observer } from 'mobx-react';
import { RESTORE_WALLET_STEPS } from './steps';
import { ReactComponent as YoroiLogo } from '../../../assets/images/yoroi-logo-shape-blue.inline.svg';
import SelectWalletTypeStep from './steps/type/SelectWalletTypeStep';
import Stepper from '../../common/stepper/Stepper';
import EnterRecoveryPhraseStep from './steps/phrase/EnterRecoveryPhraseStep';
import AddWalletDetailsStep from '../create-wallet/AddWalletDetailsStep';
import { markDialogAsShown } from '../dialogs/utils';
import { ROUTES } from '../../../routes-config';
import { useRestoreWallet } from './hooks';
import { ampli } from '../../../../ampli/index';
import { runInAction } from 'mobx';
import { isWalletExist } from '../../../stores/toplevel/WalletRestoreStore';
import type { StoresMap } from '../../../stores';
import { forceNonNull } from '../../../coreUtils';
import type { RestoreModeType } from '../../../stores/toplevel/WalletRestoreStore';

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

const LogoIconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& defs': {
      '& linearGradient': {
        '& stop': {
          'stop-color': theme.palette.ds.el_primary_medium,
        },
      },
    },
  },
}));

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  stores: StoresMap,
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
  const { intl, stores, restoreWallet, isDialogOpen, openDialog, closeDialog } = props;
  const {
    walletRestore,
    profile: profileData,
    wallets,
    tokenInfoStore,
  } = stores;

  const [currentStep, setCurrentStep] = useState(RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE);
  const [selectedRestoreMode, setSelectedRestoreMode] = useState<?RestoreModeType>(null);
  const { recoveryPhrase, duplicatedWallet, setRestoreWalletData, resetRestoreWalletData } = useRestoreWallet();

  const getDuplicatedWalletData = () => {
    if (!duplicatedWallet) return null;

    return {
      plate: duplicatedWallet.plate,
      conceptualWalletName: duplicatedWallet.name,
      balance: duplicatedWallet.balance,
      shouldHideBalance: profileData.shouldHideBalance,
      tokenInfo: tokenInfoStore.tokenInfo,
      updateHideBalance: () => stores.profile.updateHideBalance(),
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

  function handleGoToRoute(route) {
    stores.routing.goToRoute(route);
  }

  function goToAddWalletScreen() {
    handleGoToRoute({ route: ROUTES.WALLETS.ADD });
  }

  const steps = {
    [RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE]: {
      stepId: RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE,
      message: messages.firstStep,
      component: (
        <SelectWalletTypeStep
          onNext={mode => {
            resetRestoreWalletData();
            runInAction(() => {
              setSelectedRestoreMode(mode);
              setCurrentStep(RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE);
            });
            ampli.restoreWalletEnterPhraseStepViewed({
              recovery_phrase_lenght: mode.length === 15 ? '15' : '24',
            });
          }}
          goBack={() => {
            resetRestoreWalletData();
            goToAddWalletScreen();
          }}
        />
      ),
    },
    [RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE]: {
      stepId: RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE,
      message: messages.secondStep,
      component: (
        <EnterRecoveryPhraseStep
          mode={selectedRestoreMode}
          initialRecoveryPhrase={recoveryPhrase}
          duplicatedWalletData={getDuplicatedWalletData()}
          isDialogOpen={isDialogOpen}
          openDialog={openDialog}
          closeDialog={closeDialog}
          setCurrentStep={step => {
            setCurrentStep(step);
            ampli.restoreWalletDetailsStepViewed();
          }}
          checkValidPhrase={phrase => {
            if (!selectedRestoreMode) {
              throw new Error('unexpected nullish restore mode');
            }
            const isValid = walletRestore.isValidMnemonic({ mnemonic: phrase, mode: selectedRestoreMode });
            return isValid;
          }}
          openDuplicatedWallet={lastDuplicatedWalletId => {
            resetRestoreWalletData();
            wallets.setActiveWallet({ publicDeriverId: lastDuplicatedWalletId });
            handleGoToRoute({ route: ROUTES.WALLETS.TRANSACTIONS });
          }}
          onSubmit={async enteredRecoveryPhrase => {
            const importedWallets = wallets.wallets;
            const accountIndex = walletRestore.selectedAccount;
            const { selectedNetwork } = profileData;
            if (!selectedNetwork) {
              throw new Error('unexpectedly missing selected network');
            }
            const existingWallet = await isWalletExist(importedWallets, enteredRecoveryPhrase, accountIndex, selectedNetwork);

            setRestoreWalletData({
              duplicatedWallet: existingWallet,
              recoveryPhrase: enteredRecoveryPhrase,
            });

            return existingWallet?.publicDeriverId;
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
          selectedNetwork={forceNonNull(profileData.selectedNetwork)}
          onSubmit={(walletName: string, walletPassword: string) => {
            if (!recoveryPhrase) throw new Error('Recovery phrase must be generated first');
            if (!profileData.selectedNetwork) throw new Error('Network must be selected to create a wallet. Should never happen');

            restoreWallet({ walletName, walletPassword, recoveryPhrase });
            ampli.restoreWalletDetailsSettled();
          }}
          {...manageDialogsProps}
        />
      ),
    },
  };

  const stepperSteps = Object.keys(steps)
    .map(key => ({ stepId: steps[key].stepId, message: steps[key].message }))

  const CurrentStep = steps[currentStep].component;

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
          <LogoIconWrapper>
            <YoroiLogo />
          </LogoIconWrapper>
        </Box>
        <Typography component="div" variant="h3" fontWeight={500} id="restoreTitle" color="ds.text_gray_medium">
          {intl.formatMessage(messages.title)}
        </Typography>
      </Box>
      <Stepper currentStep={currentStep} setCurrentStep={setCurrentStep} steps={stepperSteps} />
      {CurrentStep}
    </Box>
  );
}

export default (injectIntl(observer(RestoreWalletPage)): ComponentType<Props>);
