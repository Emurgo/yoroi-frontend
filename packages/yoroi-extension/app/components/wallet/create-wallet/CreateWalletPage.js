// @flow
import { Node, ComponentType, useState } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg'
import CreateWalletSteps from './CreateWalletSteps';
import LearnAboutRecoveryPhrase from './LearnAboutRecoveryPhrase';
import { CREATE_WALLET_SETPS } from './steps';
import SaveRecoveryPhraseStep from './SaveRecoveryPhraseStep';

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
  const { intl } = props;
  const [currentStep, setCurrentStep] = useState(CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE);

  const steps = {
    [CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE]: (
      <LearnAboutRecoveryPhrase
        setCurrentStep={setCurrentStep}
      />
    ),
    [CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE]: (
      <SaveRecoveryPhraseStep
        setCurrentStep={setCurrentStep}
      />
    ),
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
      <CreateWalletSteps currentStep={currentStep} />
      {CurrentStep}
    </Box>
  );
}


export default (injectIntl(observer(CreateWalletPage)) : ComponentType<Props> )