// @flow
import { useEffect } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box, Link } from '@mui/material';
import StepController from './StepController';
import SaveRecoveryPhraseTipsDialog from './SaveRecoveryPhraseTipsDialog';
import { ReactComponent as InfoIcon } from '../../../assets/images/info-icon-primary.inline.svg';
import { isDialogShownBefore, TIPS_DIALOGS } from './steps';
import globalMessages from '../../../i18n/global-messages';
import type { ManageDialogsProps } from './CreateWalletPage';
import { messages as infoDialogMessages } from '../../widgets/infoDialog';

const messages: * = defineMessages({
  description: {
    id: 'wallet.create.firstStep.description',
    defaultMessage:
      '!!!A recovery phrase is a secret series of words that can be used to recover your Yoroi Wallet. See the video below how to <strong>use a recovery phrase</strong>.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  nextStep(): void,
  prevStep(): void,
  ...ManageDialogsProps,
|};

//! Note: this component will be disabled for now until the video about creating
//! new wallet is ready.
// eslint-disable-next-line no-unused-vars
function _LearnAboutRecoveryPhrase(props: Props & Intl): Node {
  const { nextStep, prevStep, isDialogOpen, openDialog, closeDialog, intl } = props;

  const isActiveDialog = isDialogOpen(SaveRecoveryPhraseTipsDialog);

  useEffect(() => {
    if (!isActiveDialog && !isDialogShownBefore(TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE))
      openDialog(SaveRecoveryPhraseTipsDialog);
  }, []);

  return (
    <Stack alignItems="center" justifyContent="center">
      <Stack direction="column" alignItems="center" justifyContent="center" maxWidth="648px">
        <Typography component="div" mb="16px" variant="body1">
          <FormattedHTMLMessage {...messages.description} />
          <Box
            component="span"
            sx={{
              cursor: 'pointer',
              ml: '4px',
              '& svg': {
                mb: '-5px',
              },
            }}
            onClick={() => openDialog(SaveRecoveryPhraseTipsDialog)}
          >
            <InfoIcon />
          </Box>
        </Typography>

        <Box sx={{ height: '365px', width: '100%' }}>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/_ltQayKP5ek"
            title="Introducing EMURGO"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ borderRadius: '8px' }}
          />
        </Box>

        <StepController
          actions={[
            {
              label: intl.formatMessage(globalMessages.backButtonLabel),
              disabled: false,
              onClick: prevStep,
              type: 'secondary',
            },
            {
              label: intl.formatMessage(globalMessages.nextButtonLabel),
              disabled: false,
              onClick: nextStep,
              type: 'primary',
            },
          ]}
        />
      </Stack>
      <SaveRecoveryPhraseTipsDialog open={isActiveDialog} onClose={() => closeDialog(TIPS_DIALOGS.LEARN_ABOUT_RECOVERY_PHRASE)} />
    </Stack>
  );
}

const text: * = defineMessages({
  shortDescription: {
    id: 'wallet.create.firstStep.shortDescription',
    defaultMessage: '!!!<strong>Read this information carefully</strong> before saving your recovery phrase:',
  },
  firstTip: {
    id: 'wallet.create.firstStep.firstTip',
    defaultMessage: '!!!<strong>Recovery phrase</strong> is a unique combination of words',
  },
  secondTip: {
    id: 'wallet.create.firstStep.secondTip',
    defaultMessage: '!!!<strong>Recovery phrase</strong> is the only way to access your wallet',
  },
  thirdTip: {
    id: 'wallet.create.firstStep.thirdTip',
    defaultMessage: '!!!If you lose your <strong>recovery phrase</strong>, it will not be possible to recover your wallet',
  },
  fourthTip: {
    id: 'wallet.create.firstStep.fourthTip',
    defaultMessage: '!!!You are the only person who knows and stores your <strong>recovery phrase</strong>',
  },
  fifthTip: {
    id: 'wallet.create.firstStep.fifthTip',
    defaultMessage:
      '!!!<strong>Yoroi NEVER</strong> asks for your <strong>recovery phrase</strong>. Watch out for scammers and impersonators',
  },
});

function LearnAboutRecoveryPhrase(props: Props & Intl): Node {
  const { nextStep, prevStep, intl } = props;
  const tips = [text.firstTip, text.secondTip, text.thirdTip, text.fourthTip, text.fifthTip];

  return (
    <Stack alignItems="center" justifyContent="center" id="learnAboutRecoveryPhraseComponent">
      <Stack maxWidth="648px">
        <Typography component="div" mb="16px" variant="body1">
          <FormattedHTMLMessage {...text.shortDescription} />
        </Typography>

        <Stack
          sx={{
            background: theme => theme.palette.ds.bg_gradient_1,
            borderRadius: theme => theme.shape.borderRadius + 'px',
            padding: '16px',
            paddingLeft: '40px',
            color: 'ds.gray_max',
          }}
        >
          <Box
            component="ul"
            sx={{
              listStyle: 'outside',
            }}
          >
            {tips.map(tip => (
              <Box component="li" key={tip.id}>
                <Typography component="div" variant="body1" color="ds.gray_max" mb="4px">
                  <FormattedHTMLMessage {...tip} />
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>

        <Link
          href="https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi-"
          target="_blank"
          rel="noreferrer noopener"
          sx={{
            textDecoration: 'none',
            display: 'block',
            py: '16px',
            mb: '20px',
          }}
        >
          {intl.formatMessage(infoDialogMessages.learnMore)}
        </Link>

        <StepController
          actions={[
            {
              label: intl.formatMessage(globalMessages.backButtonLabel),
              disabled: false,
              onClick: prevStep,
              type: 'secondary',
            },
            {
              label: intl.formatMessage(globalMessages.nextButtonLabel),
              disabled: false,
              onClick: nextStep,
              type: 'primary',
            },
          ]}
        />
      </Stack>
    </Stack>
  );
}

export default (injectIntl(observer(LearnAboutRecoveryPhrase)): ComponentType<Props>);
