// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as BeginnerLevel } from '../../../assets/images/complexity-level/beginner-level.inline.svg';
import { ReactComponent as AdvancedLevel } from '../../../assets/images/complexity-level/advanced-level.inline.svg';
import LocalizableError from '../../../i18n/LocalizableError';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import { Box, Typography, styled } from '@mui/material';
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

const GradientBox = styled(Box)(({ theme, isSelected }) => ({
  maxWidth: '294px',
  maxHeight: '362px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'center',
  alignSelf: 'stretch',
  padding: '16px',
  cursor: isSelected ? 'not-allowed' : 'pointer',
  backgroundImage: isSelected ? theme.palette.ds.bg_gradient_2 : 'unset',
  outline: `solid 1px ${isSelected ? 'transparent' : theme.palette.ds.gray_200}`,
  borderRadius: '8px',
  '&:hover': {
    backgroundImage: theme.palette.ds.bg_gradient_1,
    outlineColor: 'transparent',
    '&::before': {
      opacity: 1,
    },
  },
  '&::before': {
    opacity: 0,
    transition: 'opacity 300ms linear',
  }
}));

type Props = {|
  +complexityLevel: ?ComplexityLevelType,
  +onSubmit: ComplexityLevelType => PossiblyAsync<void>,
  +error?: ?LocalizableError,
  +baseTheme?: string,
|};

export default class ComplexityLevel extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { complexityLevel } = this.props;

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
      <Box maxWidth="930px" margin="0 auto" mt="24px">
        <Typography
          component="div"
          textAlign="center"
          color="ds.text_gray_medium"
          mb="16px"
          variant="h3"
          fontWeight={500}
        >
          {intl.formatMessage(settingsMenuMessages.levelOfComplexity)}
        </Typography>

        <Typography
          component="div"
          textAlign="center"
          variant="body1"
          color="ds.text_gray_low"
        >
          {intl.formatMessage(messages.subtitle)}
        </Typography>

        {complexityLevel && (
          <Typography
            component="div"
            variant="body1"
            my="1rem"
            mx="auto"
            color="ds.text_gray_medium"
            sx={{
              textAlign: 'center',
              '& strong': {
                color: 'ds.text_primary_medium',
                fontWeight: 500,
                textTransform: 'uppercase',
              },
            }}
          >
            <FormattedMessage
              {...messages.selectedLevelLabel}
              values={{
                level: intl.formatMessage(
                  complexityLevel === ComplexityLevels.Advanced ? messages.titleAdvancedLevel : messages.titleSimpleLevel
                ),
              }}
            />
          </Typography>
        )}

        <Box display="flex" alignItems="center" justifyContent="center" mt="32px">
          <Box display="flex" flexDirection="row" justifyContent="center" gap="24px">
          {levels.map(level => {
              const isSelected = level.key === complexityLevel;
              return (
                <GradientBox
                  key={level.key}
                  isSelected={isSelected}
                  onClick={() => this.props.onSubmit(level.key)}
                >
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Box sx={{ mb: '16px' }} width="180px" height="116px">{level.image}</Box>
                    <Box>
                      <Typography component="div" mb="4px" variant="h3" fontWeight={500} color="ds.text_gray_medium">
                        {level.name}
                      </Typography>
                      <Typography component="div" variant="body2" color="ds.text_gray_medium">
                        {level.description}
                      </Typography>
                    </Box>
                  </Box>
                </GradientBox>
              );
              })
          }
          </Box>
        </Box>
      </Box>
    );
  }
}
