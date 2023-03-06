// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Box, Typography, Grid } from '@mui/material'
import StepController from './StepController';
import { CREATE_WALLET_SETPS } from './steps';
import styles from './VerifyRecoveryPhraseStep.scss';

const messages: * = defineMessages({
  description: {
    id: 'wallet.create.thirdStep.description',
    defaultMessage: '!!!<strong>Select</strong> each word in <strong>the correct order</strong> to confirm your recovery phrase.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
    currentStep: string,
|};

function VerifyRecoveryPhraseStep(props: Props & Intl): Node {
  const { recoveryPhrase, setCurrentStep } = props;

  if (!recoveryPhrase) throw new Error('Missing recovery phrase, should never happen');

  return (
    <Stack alignItems='center' justifyContent='center' className={styles.component}>
      <Stack direction='column' alignItems='left' justifyContent='center' maxWidth='690px'>
        <Typography mb='16px'>
          <FormattedHTMLMessage {...messages.description} />
        </Typography>

        <Box className={styles.verifyRecoveryPhraseArea}>
          <Stack
            gap='8px'
            p='16px 14px'
            flexDirection='row'
            flexWrap='wrap'
            alignItems='center'
            justifyContent='center'
          >
            {recoveryPhrase.map((word, idx) => (
              <Stack
                item
                key={word}
                columns={7}
              >
                <Box
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  variant='body1'
                  color='primary.200'
                >
                  <Typography
                    variant='body1'
                    color='primary.200'
                    width='20px'
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {idx + 1}.
                  </Typography>
                  <Typography
                    sx={{
                      background: 'linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 99.98%)',
                      width: '100px',
                      height: '40px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      ml: '4px'
                    }}
                  >
                    {word}
                  </Typography>
                </Box>
              </Stack>
           ))}
          </Stack>
        </Box>

        <Stack
          flexDirection='row'
          flexWrap='wrap'
          alignItems='center'
          justifyContent='center'
          gap='8px'
        >
          {recoveryPhrase.map((word) => (
            <Stack
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
                cursor: 'pointer',
              }}
            >
              <Typography
                sx={{
                  width: '131px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  px: '10px',
                }}
                variant='body1'
                color='primary.200'
              >
                {word}
              </Typography>
            </Stack>
            ))}
        </Stack>

        <StepController
          goNext={() => setCurrentStep(CREATE_WALLET_SETPS.ADD_WALLET_DETAILS)}
          goBack={() => setCurrentStep(CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE)}
        />
      </Stack>
    </Stack>
  );
}

export default (observer(VerifyRecoveryPhraseStep) : ComponentType<Props>);