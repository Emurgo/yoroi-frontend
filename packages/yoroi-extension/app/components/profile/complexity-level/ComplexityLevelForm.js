// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import { Component } from 'react';
import { intlShape, defineMessages, FormattedHTMLMessage } from 'react-intl';
import styles from './ComplexityLevelForm.scss';
import classnames from 'classnames';
import { ReactComponent as BeginnerLevel } from '../../../assets/images/complexity-level/beginner-level.inline.svg';
import { ReactComponent as AdvancedLevel } from '../../../assets/images/complexity-level/advanced-level.inline.svg';
import LocalizableError from '../../../i18n/LocalizableError';
import { LoadingButton } from '@mui/lab';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import { withLayout } from '../../../styles/context/layout';
import { Box, Typography } from '@mui/material';
import { settingsMenuMessages } from '../../settings/menu/SettingsMenu';

const messages = defineMessages({
  subtitle: {
    id: 'profile.complexityLevel.subtitle',
    defaultMessage:
      '!!!We understand blockchain can be difficult, which is why we try and keep the interface as simple as possible for you',
  },
  titleSimpleLevel: {
    id: 'profile.complexityLevel.simple',
    defaultMessage: '!!!Simple',
  },
  titleAdvancedLevel: {
    id: 'profile.complexityLevel.advanced',
    defaultMessage: '!!!Advanced',
  },
  descriptionSimpleLevel: {
    id: 'profile.complexityLevel.simple.description',
    defaultMessage:
      '!!!Simplest experience possible. No previous knowledge of blockchain required. Highly friendly to on-board beginners, and for users who prefer simplicity.',
  },
  descriptionAdvancedLevel: {
    id: 'profile.complexityLevel.advanced.description',
    defaultMessage:
      '!!!I have some understanding of blockchain and how cryptography is used to power both the blockchain itself and the wallet software. I am okay with seeing options and functionality that critically depend on my understanding of these concepts.',
  },
  labelSelectedLevel: {
    id: 'profile.complexityLevel.selected.label',
    defaultMessage: '!!!Your current level of Complexity is',
  },
  selectedLevelLabel: {
    id: 'profile.complexityLevel.selected.labelWithLevel',
    defaultMessage: '!!!Your current level of Complexity is : <strong>{level}</strong>',
  },
  labelChoose: {
    id: 'global.label.choose',
    defaultMessage: '!!!Choose',
  },
});
type Props = {|
  +complexityLevel: ?ComplexityLevelType,
  +onSubmit: ComplexityLevelType => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

class ComplexityLevel extends Component<Props & InjectedProps> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { complexityLevel, isSubmitting, isRevampLayout } = this.props;

    const levels = [
      {
        key: ComplexityLevels.Simple,
        name: intl.formatMessage(messages.titleSimpleLevel),
        image: <BeginnerLevel />,
        description: intl.formatMessage(messages.descriptionSimpleLevel),
      },
      {
        key: ComplexityLevels.Advanced,
        name: intl.formatMessage(messages.titleAdvancedLevel),
        image: <AdvancedLevel />,
        description: intl.formatMessage(messages.descriptionAdvancedLevel),
      },
    ];

    return (
      <Box className={styles.component}>
        {isRevampLayout && (
          <Typography
            component="div"
            textAlign="center"
            color="grayscale.900"
            mb="16px"
            variant="h3"
            fontWeight={500}
          >
            {intl.formatMessage(settingsMenuMessages.levelOfComplexity)}
          </Typography>
        )}

        <Typography
          component="div"
          textAlign="center"
          variant="body1"
          color={isRevampLayout ? 'grayscale.800' : 'gray.600'}
        >
          {intl.formatMessage(messages.subtitle)}
        </Typography>

        {complexityLevel && (
          <Typography
            component="div"
            variant="body1"
            my="1rem"
            mx="auto"
            sx={{
              textAlign: 'center',
              '& strong': {
                color: isRevampLayout ? 'primary.500' : 'secondary.300',
                fontWeight: 500,
                textTransform: 'uppercase',
              },
            }}
          >
            <FormattedHTMLMessage
              {...messages.selectedLevelLabel}
              values={{
                level: intl.formatMessage(
                  complexityLevel === ComplexityLevels.Advanced
                    ? messages.titleAdvancedLevel
                    : messages.titleSimpleLevel
                ),
              }}
            />
          </Typography>
        )}

        {isRevampLayout ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              mt: '32px',
              maxWidth: '700px',
            }}
          >
            {levels.map(level => {
              const isSelected = level.key === complexityLevel;

              return (
                <Box
                  key={level.key}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    textAlign: 'center',
                    p: '1px',
                    border: 'solid 1px transparent',
                    background: theme =>
                      isSelected
                        ? theme.palette.gradients['bg-gradient-2']
                        : 'linear-gradient( 0deg, var(--yoroi-palette-common-white), var(--yoroi-palette-common-white)), linear-gradient(180deg, #e4e8f7 0%, #c6f7f7 100%)',
                    backgroundClip: 'content-box, border-box',
                    backgroundOrigin: 'border-box',
                    borderRadius: '8px',
                    alignSelf: 'stretch',
                    cursor: isSelected ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    zIndex: 1,
                    '&::before': {
                      position: 'absolute',
                      content: '""',
                      top: '0px',
                      right: '0px',
                      left: '0px',
                      bottom: '0px',
                      background: theme => theme.palette.gradients['blue-green-bg'],
                      borderRadius: '8px',
                      zIndex: -1,
                      opacity: 0,
                      transition: 'opacity 300ms linear',
                    },
                    '&:hover::before': {
                      opacity: 1,
                    },
                  }}
                  onClick={() => this.props.onSubmit(level.key)}
                >
                  <Box sx={{ p: '15px' }}>
                    <Box sx={{ mb: '16px' }}>{level.image}</Box>
                    <Box mb="10px">
                      <Typography component="div" mb="4px" variant="h3" fontWeight={500}>
                        {level.name}
                      </Typography>
                      <Typography component="div" variant="body2">
                        {level.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <div className={styles.cardsWrapper}>
            {levels.map(level => (
              <Box className={styles.card} sx={{ bgcolor: 'gratscale.min' }} key={level.key}>
                <Box
                  sx={{ bgcolor: 'grayscale.100' }}
                  className={classnames([styles.cardImage, styles[level.key]])}
                >
                  {level.image}
                </Box>
                <Box sx={{ bgcolor: 'grayscale.900' }} className={styles.cardContent}>
                  <div>
                    <h3>{level.name}</h3>
                    <div>{level.description}</div>
                  </div>
                  <LoadingButton
                    variant={isRevampLayout ? 'contained' : 'primary'}
                    loading={isSubmitting}
                    disabled={complexityLevel === level.key}
                    onClick={() => this.props.onSubmit(level.key)}
                  >
                    {intl.formatMessage(messages.labelChoose)}
                  </LoadingButton>
                </Box>
              </Box>
            ))}
          </div>
        )}
      </Box>
    );
  }
}

export default (withLayout(ComplexityLevel): ComponentType<Props>);
