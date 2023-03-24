// @flow
import { Node, ComponentType, useState } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box } from '@mui/material';
import StepController from './StepController';
import { CREATE_WALLET_SETPS } from './steps';
import HowToSaveRecoverPhraseTipsDialog from './HowToSaveRecoverPhraseTipsDialog';
import RecoveryPhrase from './RecoveryPhrase';
import { ReactComponent as InfoIcon } from '../../../assets/images/info-icon-primary.inline.svg';
import globalMessages from '../../../i18n/global-messages';

const messages: * = defineMessages({
  description: {
    id: 'wallet.create.secondStep.description',
    defaultMessage: '!!!Click <strong>“Show recovery phrase”</strong> below to reveal and keep it.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  setCurrentStep(step: string): void,
  recoveryPhrase: Array<string> | null,
|};

function SaveRecoveryPhraseStep(props: Props & Intl): Node {
  const { setCurrentStep, recoveryPhrase, shouldShowDialog, showDialog, hideDialog, intl } = props;
  const [shouldShowRecoveryPhrase, showRecoveryPhrase] = useState(false);

  return (
    <Stack alignItems="center" justifyContent="center">
      <Stack direction="column" alignItems="left" justifyContent="center" maxWidth="700px">
        <Stack mb="8px" flexDirection="row" alignItems="center" gap="6px">
          <Typography>
            <FormattedHTMLMessage {...messages.description} />
          </Typography>
          <Box sx={{ cursor: 'pointer' }} onClick={showDialog}>
            <InfoIcon />
          </Box>
        </Stack>

        {recoveryPhrase && (
          <RecoveryPhrase
            recoveryPhrase={recoveryPhrase}
            shouldShowRecoveryPhrase={shouldShowRecoveryPhrase}
            toggleRecoveryPhrase={() => showRecoveryPhrase(!shouldShowRecoveryPhrase)}
          />
        )}

        <StepController
          actions={[
            {
              label: intl.formatMessage(globalMessages.backButtonLabel),
              disabled: false,
              onClick: () => setCurrentStep(CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE),
              type: 'secondary',
            },
            {
              label: intl.formatMessage(globalMessages.nextButtonLabel),
              disabled: !shouldShowRecoveryPhrase,
              onClick: () => setCurrentStep(CREATE_WALLET_SETPS.VERIFY_RECOVERY_PHRASE),
              type: 'primary',
            },
          ]}
        />
      </Stack>

      <HowToSaveRecoverPhraseTipsDialog open={shouldShowDialog} onClose={hideDialog} />
    </Stack>
  );
}

export default (injectIntl(observer(SaveRecoveryPhraseStep)): ComponentType<Props>);
