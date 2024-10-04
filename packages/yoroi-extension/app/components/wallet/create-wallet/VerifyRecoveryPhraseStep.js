// @flow
import { useState, useMemo } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Box, Typography, Button, styled } from '@mui/material';
import StepController from './StepController';
import { ReactComponent as VerifiedIcon } from '../../../assets/images/verify-icon-green.inline.svg';
import environment from '../../../environment';
import { makeSortedPhrase } from '../../../utils/recoveryPhrase';
import globalMessages from '../../../i18n/global-messages';
import Fade from '@mui/material/Fade';
import { ampli } from '../../../../ampli/index';

const messages = defineMessages({
  description: {
    id: 'wallet.create.thirdStep.description',
    defaultMessage:
      '!!!<strong>Select</strong> each word in <strong>the correct order</strong> to confirm your recovery phrase.',
  },
  incorrectOrder: {
    id: 'wallet.create.thirdStep.incorrectOrder',
    defaultMessage: '!!!Incorrect order. Try again',
  },
  verified: {
    id: 'walllet.create.thirdStep.verifiedRecoveryPhrase',
    defaultMessage: '!!!The recovery phrase is verified',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  recoveryPhrase: Array<string> | null,
  nextStep: () => void,
  prevStep: () => void,
  isRecoveryPhraseEntered: boolean,
|};

const SBox = styled(Box)(({ theme }) => ({
  background: theme.palette.ds.primary_100,
}));

function VerifyRecoveryPhraseStep(props: Props & Intl): Node {
  const { intl, recoveryPhrase, isRecoveryPhraseEntered, nextStep, prevStep } = props;
  if (!recoveryPhrase) throw new Error('Missing recovery phrase, should never happen');

  const [enteredRecoveryPhrase, setRecoveryPhrase] = useState(
    isRecoveryPhraseEntered ? recoveryPhrase : new Array(recoveryPhrase.length).fill(null)
  );
  const [wrongWordIdx, setWrongWordIdx] = useState<number | null>(null);
  const [addedWordsIndxes, setAddedWordsIndexes] = useState(new Set());
  const [fadeOutWordIdx, setFadeOutWordIdx] = useState<number>(-1); // Recovery phrase word index

  function onAddWord(word: string, idx: number): void {
    if (addedWordsIndxes.has(idx)) return;

    const nextWordIdx = enteredRecoveryPhrase.findIndex(w => w === null);
    if (nextWordIdx === -1) throw new Error('Entered recovery phrase words list is full');

    const isInCorrectOrder = recoveryPhrase[nextWordIdx] === word;
    if (!isInCorrectOrder) return setWrongWordIdx(idx);

    setRecoveryPhrase(prev => {
      const copy = [...prev];
      copy[nextWordIdx] = word;
      return copy;
    });
    setWrongWordIdx(null);
    setFadeOutWordIdx(idx);

    // Mark word as added
    const addedWords = new Set(addedWordsIndxes);
    addedWords.add(idx);
    setAddedWordsIndexes(addedWords);

    ampli.createWalletVerifyPhraseWordSelected();
  }

  const isValidPhrase = !recoveryPhrase.some((word, idx) => word !== enteredRecoveryPhrase[idx]);
  const sortedRecoveryPhrase = useMemo(() => makeSortedPhrase(recoveryPhrase), [recoveryPhrase]);

  return (
    <Stack alignItems="center" justifyContent="center" id="verifyRecoveryPhraseStepComponent">
      <Stack direction="column" alignItems="left" justifyContent="center" maxWidth="648px">
        <Typography component="div" mb="16px">
          <FormattedHTMLMessage {...messages.description} />
        </Typography>

        <Box
          sx={{
            border: 'double 2px transparent',
            borderRadius: '8px',
            borderColor: 'primary.100',
            marginBottom: '16px',
          }}
        >
          <Stack
            gap="8px"
            flexDirection="row"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="center"
            sx={{
              paddingY: '16px',
            }}
          >
            {enteredRecoveryPhrase.map((word, idx) => {
              const isLastEnteredWord =
                !isRecoveryPhraseEntered &&
                (idx === enteredRecoveryPhrase.length - 1 ||
                  enteredRecoveryPhrase[idx + 1] === null);

              const Word = (
                <SBox
                  sx={{
                    borderRadius: '8px',
                    width: '93px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: '4px',
                  }}
                >
                  <Typography component="div"
                    sx={{
                      display: 'block',
                      cursor: 'default',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {word}
                  </Typography>
                </SBox>
              );
              return (
                <Stack
                  item
                  // eslint-disable-next-line react/no-array-index-key
                  key={idx}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: '117px',
                      height: '40px',
                    }}
                    variant="body1"
                    color="primary.600"
                  >
                    <Typography component="div" variant="body1" color="primary.400" width="20px">
                      {idx + 1}.
                    </Typography>
                    {word !== null &&
                      (isLastEnteredWord ? (
                        <Fade in timeout={500}>
                          {Word}
                        </Fade>
                      ) : (
                        Word
                      ))}
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Box>
        <Stack
          flexDirection="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="center"
          gap="8px"
        >
          {sortedRecoveryPhrase.map(({ word, internalWordId }, idx) => {
            const isAdded = addedWordsIndxes.has(idx);
            const wrongWordBorderColor = (wrondWordId, currentId) => wrongWordIdx === currentId ? 'magenta.500' : 'transparent';
            const wordBorderColor = (wrondWordId, currentId) => isAdded ? 'primary.200' : wrongWordBorderColor(wrondWordId, currentId);
            const isAddedOrIsWrong = isAdded || wrongWordIdx === idx
            const button = (
              <Box
                component="button"
                key={internalWordId}
                onClick={() => onAddWord(word, idx)}
                disabled={isAdded}
                sx={{
                  height: '40px',
                  width: '123px',
                  backgroundColor: isAddedOrIsWrong ? 'transparent' : 'primary.100',
                  border: isAddedOrIsWrong ? 2 : 0,
                  borderRadius: '8px',
                  borderColor: wordBorderColor(wrongWordIdx, idx),
                }}
                id={'verifyRecoveryPhraseWord' + idx}
              >
                <Typography component="div"
                  sx={{
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    px: '10px',
                    zIndex: 10,
                  }}
                  variant="body1"
                  color={isAdded ? 'primary.400' : 'primary.600'}
                >
                  {word}
                </Typography>
              </Box>
            );
            return fadeOutWordIdx === idx ? (
              <Fade in timeout={500}>
                {button}
              </Fade>
            ) : (
              button
            );
          })}
        </Stack>

        <Box height="28px" mt="16px">
          {wrongWordIdx !== null && (
            <Typography component="div" variant="body2" color="magenta.500" id="incorrectOrderMessage">
              {intl.formatMessage(messages.incorrectOrder)}
            </Typography>
          )}

          <Fade in={isValidPhrase}>
            <Stack gap="10px" direction="row" id="isValidPhraseMessage">
              <VerifiedIcon />
              <Typography component="div" variant="body1" fontWeight={500}>
                {intl.formatMessage(messages.verified)}
              </Typography>
            </Stack>
          </Fade>
        </Box>

        <Box mt="10px">
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
                disabled: !isValidPhrase,
                onClick: nextStep,
                type: 'primary',
              },
            ]}
          />
        </Box>

        {environment.isDev() && (
          <Button
            onClick={() => {
              if (!recoveryPhrase) return;
              setRecoveryPhrase(recoveryPhrase);
              setWrongWordIdx(null);
              setAddedWordsIndexes(new Set(recoveryPhrase.map((_, idx) => idx)));
            }}
            onDoubleClick={() => {
              setRecoveryPhrase(new Array(recoveryPhrase.length).fill(null));
              setAddedWordsIndexes(new Set());
            }}
          >
            Auto Enter
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

export default (injectIntl(observer(VerifyRecoveryPhraseStep)): ComponentType<Props>);
