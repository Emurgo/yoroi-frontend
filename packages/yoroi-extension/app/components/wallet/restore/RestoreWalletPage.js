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
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg';
import SelectWalletTypeStep from './steps/type/SelectWalletTypeStep';
import Stepper from '../../common/stepper/Stepper';
import EnterRecoveryPhraseStep from './steps/phrase/EnterRecoveryPhraseStep';
// import LearnAboutRecoveryPhrase from './LearnAboutRecoveryPhrase';
// import SaveRecoveryPhraseStep from './SaveRecoveryPhraseStep';
// import VerifyRecoveryPhraseStep from './VerifyRecoveryPhraseStep';

const messages: * = defineMessages({
  title: {
    id: 'wallet.restore.page.title',
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

type Props = {||};

function RestoreWalletPage(props: Props & Intl): Node {
  const { intl } = props;
  const [currentStep, setCurrentStep] = useState(RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE);
  const [numWords, setNumWords] = useState<number>(15);
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
    [RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE]: {
      stepId: RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE,
      message: messages.firstStep,
      component: (
        <SelectWalletTypeStep
          onNext={numWords => {
            setCurrentStep(RESTORE_WALLET_STEPS.ENTER_RECOVERY_PHRASE);
            setNumWords(numWords);
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
          currentStep={currentStep}
          numWords={numWords}
          checkValidPhrase={phrase => console.log(phrase) ?? true}
        />
      ),
    },
    [RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS]: {
      stepId: RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS,
      message: messages.thirdStep,
      component: null,
    },
  };

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
          <img src={YoroiLogo} alt="Yoroi" title="Yoroi" />
        </Box>
        <Typography variant="h3">{intl.formatMessage(messages.title)}</Typography>
      </Box>
      <Stepper
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        steps={Object.values(steps)}
      />
      {CurrentStep}
    </Box>
  );
}

export default (injectIntl(observer(RestoreWalletPage)): ComponentType<Props>);
