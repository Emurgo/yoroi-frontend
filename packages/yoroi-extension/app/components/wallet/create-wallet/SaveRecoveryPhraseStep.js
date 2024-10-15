// @flow
import { useEffect, useState } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box } from '@mui/material';
import StepController from './StepController';
import { CREATE_WALLET_SETPS, isDialogShownBefore, TIPS_DIALOGS } from './steps';
import HowToSaveRecoveryPhraseTipsDialog from './HowToSaveRecoveryPhraseTipsDialog';
import RecoveryPhrase from './RecoveryPhrase';
import { ReactComponent as InfoIcon } from '../../../assets/images/info-icon-primary.inline.svg';
import globalMessages from '../../../i18n/global-messages';
import type { ManageDialogsProps } from './CreateWalletPage';

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
  ...ManageDialogsProps,
|};

function SaveRecoveryPhraseStep(props: Props & Intl): Node {
  const { setCurrentStep, recoveryPhrase, isDialogOpen, openDialog, closeDialog, intl } = props;
  const [shouldShowRecoveryPhrase, showRecoveryPhrase] = useState(false);

  const isActiveDialog = isDialogOpen(HowToSaveRecoveryPhraseTipsDialog);
  useEffect(() => {
    if (!isActiveDialog && !isDialogShownBefore(TIPS_DIALOGS.SAVE_RECOVERY_PHRASE))
      openDialog(HowToSaveRecoveryPhraseTipsDialog);
  }, []);

  return (
    <Stack alignItems="center" justifyContent="center">
      <Stack direction="column" alignItems="left" justifyContent="center" maxWidth="700px">
        <Stack mb="8px" flexDirection="row" alignItems="center" gap="6px">
          <Typography component="div">
            <FormattedHTMLMessage {...messages.description} />
          </Typography>
          <Box
            sx={{ cursor: 'pointer' }}
            onClick={() => openDialog(HowToSaveRecoveryPhraseTipsDialog)}
          >
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
          stepActions={[
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

      <HowToSaveRecoveryPhraseTipsDialog
        open={isActiveDialog}
        onClose={() => closeDialog(TIPS_DIALOGS.SAVE_RECOVERY_PHRASE)}
      />
    </Stack>
  );
}

export default (injectIntl(observer(SaveRecoveryPhraseStep)): ComponentType<Props>);
