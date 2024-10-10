// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Box, Typography, Grid, Button, styled } from '@mui/material';
import { ReactComponent as OpenedEyeIcon } from '../../../assets/images/open-eye-primary.inline.svg';
import { ReactComponent as ClosedEyeIcon } from '../../../assets/images/close-eye-primary.inline.svg';

type Props = {|
  recoveryPhrase: Array<string> | null,
  shouldShowRecoveryPhrase: boolean,
  toggleRecoveryPhrase(): void,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages: * = defineMessages({
  showRecoveryPhraseBtn: {
    id: 'wallet.create.secondStep.showRecoveryPhraseBtn',
    defaultMessage: '!!!Show recovery phrase',
  },
  hideRecoveryPhraseBtn: {
    id: 'wallet.create.secondStep.hideRecoveryPhraseBtn',
    defaultMessage: '!!!Hide recovery phrase',
  },
});

const SGrid = styled(Grid)(({ theme }) => ({
  background: theme.palette.ds.primary_100,
}));

function RecoveryPhrase(props: Props & Intl): Node {
  const { recoveryPhrase, intl, shouldShowRecoveryPhrase, toggleRecoveryPhrase } = props;

  return (
    <Box width="100%" mt="8px" id="recoveryPhraseBox">
      <Grid container gap="8px">
        {recoveryPhrase &&
          recoveryPhrase.map((word, idx) => (
            <SGrid
              item
              key={word}
              columns={7}
              sx={{
                textAlign: 'center',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '40px',
                filter: shouldShowRecoveryPhrase ? 'unset' : 'blur(4px)',
                cursor: shouldShowRecoveryPhrase ? 'auto' : 'not-allowed',
              }}
              id={'recoveryPhraseWord' + idx}
            >
              <Typography component="div"
                sx={{
                  width: '124px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  px: '10px',
                }}
                variant="body1"
                color="primary.600"
              >
                {idx + 1}. {word}
              </Typography>
            </SGrid>
          ))}
      </Grid>
      <Button
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          mt: '22px',
          ml: '-10px',
          height: 'unset',
          minHeight: 'unset',
          lineHeight: 1,
          padding: '6px',
        }}
        onClick={toggleRecoveryPhrase}
        id="toggleRecoveryPhraseButton"
      >
        {shouldShowRecoveryPhrase ? <ClosedEyeIcon /> : <OpenedEyeIcon />}
        <Typography component="div" variant="body2" fontWeight="500">
          {intl.formatMessage(
            shouldShowRecoveryPhrase
              ? messages.hideRecoveryPhraseBtn
              : messages.showRecoveryPhraseBtn
          )}
        </Typography>
      </Button>
    </Box>
  );
}

export default (injectIntl(observer(RecoveryPhrase)): ComponentType<Props>);
