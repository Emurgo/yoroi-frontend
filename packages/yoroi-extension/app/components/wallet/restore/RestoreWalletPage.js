// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { RESTORE_WALLET_STEPS } from './steps';
import { isDialogShownBefore, markDialogAsShown } from '../dialogs/utils';
import { TIPS_DIALOGS } from '../dialogs/constants';
import RestoreWalletSteps from './RestoreWalletSteps';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg';
import SelectWalletTypeStep from './steps/SelectWalletTypeStep';
// import LearnAboutRecoveryPhrase from './LearnAboutRecoveryPhrase';
// import SaveRecoveryPhraseStep from './SaveRecoveryPhraseStep';
// import VerifyRecoveryPhraseStep from './VerifyRecoveryPhraseStep';

const messages: * = defineMessages({
  title: {
    id: 'wallet.restore.page.title',
    defaultMessage: '!!!Restore existing wallet',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {||};

function RestoreWalletPage(props: Props & Intl): Node {
  const { intl } = props;
  const [currentStep, setCurrentStep] = useState(RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE);
  const [recoveryPhrase, setRecoveryPhrase] = useState(null);
  const [dialogs, setDialogs] = useState({
    [TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE]: !isDialogShownBefore(
      TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE
    ),
    [TIPS_DIALOGS.SAVE_RECOVERY_PHRASE]: !isDialogShownBefore(TIPS_DIALOGS.SAVE_RECOVERY_PHRASE),
  });

  function showDialog(dialogId: string): void {
    setDialogs(prev => ({ ...prev, [dialogId]: true }));
  }

  function hideDialog(dialogId: string): void {
    markDialogAsShown(dialogId);
    setDialogs(prev => ({ ...prev, [dialogId]: false }));
  }

  const steps = {
    [RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE]: (
      <SelectWalletTypeStep
        onNext={() => setCurrentStep(RESTORE_WALLET_STEPS.SAVE_RECOVERY_PHRASE)}
      />
    ),
    // <LearnAboutRecoveryPhrase
    //   shouldShowDialog={dialogs.LEARN_ABOUT_RECOVER_PHRASE}
    //   hideDialog={() => hideDialog(TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE)}
    //   showDialog={() => showDialog(TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE)}
    //   onNext={async () => {
    //     setCurrentStep(RESTORE_WALLET_STEPS.SAVE_RECOVERY_PHRASE);
    //     if (recoveryPhrase !== null) return;
    //     const walletRecoveryPhrase = await genWalletRecoveryPhrase();
    //     setRecoveryPhrase(walletRecoveryPhrase);
    //   }}
    // />
    [RESTORE_WALLET_STEPS.SAVE_RECOVERY_PHRASE]: null,
    // <SaveRecoveryPhraseStep
    //   shouldShowDialog={dialogs.SAVE_RECOVERY_PHRASE}
    //   hideDialog={() => hideDialog(TIPS_DIALOGS.SAVE_RECOVERY_PHRASE)}
    //   showDialog={() => showDialog(TIPS_DIALOGS.SAVE_RECOVERY_PHRASE)}
    //   setCurrentStep={setCurrentStep}
    //   recoveryPhrase={recoveryPhrase}
    // />
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
        <Typography variant="h3">{intl.formatMessage(messages.title)}</Typography>
      </Box>
      <RestoreWalletSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />
      {CurrentStep}
    </Box>
  );
}

export default (injectIntl(observer(RestoreWalletPage)): ComponentType<Props>);
