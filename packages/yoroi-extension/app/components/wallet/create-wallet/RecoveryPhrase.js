// @flow
import { useState } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Box, Typography, Grid, Stack, Button } from '@mui/material'

type Props = {|
    recoveryPhrase: Array<string> | null,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};


const messages: * = defineMessages({
  showRecoveryPhraseBtn: {
    id: 'wallet.create.secondStep.showRecoveryPhraseBtn',
    defaultMessage: '!!!Show recovery phrase',
  },
});

function RecoveryPhrase(props: Props & Intl): Node {
  const { recoveryPhrase, intl } = props;
  const [open, setOpen] = useState(false);
  const [isRecoverPhraseShown, showRecoveryPhrase] = useState(false);

  return (
    <Box width="100%" mt='8px'>
      <Grid container gap='8px'>
        {recoveryPhrase.map((word, idx) => (
          <Grid
            item
            key={word}
            columns={7}
            sx={{
              background: 'linear-gradient(269deg, #E4E8F7 0%, #C6F7ED 99%)',
              textAlign: 'center',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px',
              filter: isRecoverPhraseShown ? 'unset' : 'blur(4px)',
              cursor: isRecoverPhraseShown ? 'auto' : 'not-allowed'
            }}
          >
            <Typography
              sx={{
                width: '124px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                px: '10px'
              }}
              variant='body1'
              color='primary.200'
            >
              {idx + 1}. {word}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Button size='medium' sx={{ display: 'inline-block', mt: '22px' }} onClick={() => showRecoveryPhrase(!isRecoverPhraseShown)}>
        {intl.formatMessage(messages.showRecoveryPhraseBtn)}
      </Button>
    </Box>
  )
}

export default (injectIntl(observer(RecoveryPhrase)) : ComponentType<Props>);