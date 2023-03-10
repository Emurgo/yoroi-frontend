
// @flow
import { Node, ComponentType, useState } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box } from '@mui/material'
import StepController from './StepController';
import { CREATE_WALLET_SETPS } from './steps';
import { ReactComponent as InfoIcon }  from '../../../assets/images/info-icon-primary.inline.svg';
import WalletNameAndPasswordTipsDialog from './WalletNameAndPasswordTipsDialog';

const messages: * = defineMessages({
  description: {
    id: 'wallet.create.forthStep.description',
    defaultMessage: '!!!<strong>Add</strong> your <strong>wallet name</strong> and <strong>password</strong> to complete the wallet creation.',
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
  const { setCurrentStep, shouldShowDialog, showDialog, hideDialog } = props;

  return (
    <Stack alignItems='center' justifyContent='center'>
      <Stack direction='column' alignItems='left' justifyContent='center' maxWidth='700px'>
        <Stack mb='8px' flexDirection='row' alignItems='center' gap='6px'>
          <Typography>
            <FormattedHTMLMessage {...messages.description} />
          </Typography>
          <Box sx={{ cursor: 'pointer' }} onClick={showDialog}>
            <InfoIcon />
          </Box>
        </Stack>

        <StepController
        //   goNext={goNextStepCallback()}
          goBack={() => setCurrentStep(CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE)}
        />
      </Stack>

      <WalletNameAndPasswordTipsDialog
        open={shouldShowDialog}
        onClose={hideDialog}
      />
    </Stack>
  )
}

export default (injectIntl(observer(SaveRecoveryPhraseStep)) : ComponentType<Props>);