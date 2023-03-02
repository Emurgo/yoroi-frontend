// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box } from '@mui/material'
import StepController from './StepController';
import SaveRecoveryPhraseTipsDialog from './SaveRecoveryPhraseTipsDialog';
import { ReactComponent as InfoIcon }  from '../../../assets/images/info-icon-primary.inline.svg';

const messages: * = defineMessages({
  description: {
    id: 'wallet.create.firstStep.description',
    defaultMessage: '!!!A recovery phrase is a secret series of words that can be used to recover your Yoroi Wallet. See the video below how to <strong>use a recovery phrase</strong>.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
    onNext(step: string): void,
|};

function LearnAboutRecoveryPhrase(props: Props & Intl): Node {
  const { onNext, shouldShowDialog, showDialog, hideDialog } = props;

  return (
    <Stack alignItems='center' justifyContent='center'>
      <Stack direction='column' alignItems='center' justifyContent='center' maxWidth='648px'>
        <Typography mb='16px' variant='body1'>
          <FormattedHTMLMessage {...messages.description} />
          <Box
            component='span'
            sx={{
              cursor: 'pointer',
              ml: '4px',
              '& svg': {
                mb: '-5px'
              }
          }}
            onClick={showDialog}
          >
            <InfoIcon />
          </Box>
        </Typography>

        <iframe
          width="100%"
          height="365px"
          src="https://www.youtube.com/embed/_ltQayKP5ek"
          title="Introducing EMURGO"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ borderRadius: '8px' }}
        />

        <StepController
          goNext={onNext}
        />
      </Stack>
      <SaveRecoveryPhraseTipsDialog
        open={shouldShowDialog}
        onClose={hideDialog}
      />
    </Stack>
  );
}

export default (injectIntl(observer(LearnAboutRecoveryPhrase)) : ComponentType<Props>);