// @flow
import { FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import { Component } from 'react';
import { FormattedHTMLMessage, FormattedMessage, defineMessages, intlShape } from 'react-intl';
import { ReactComponent as YoroiClassicTheme } from '../../../../assets/images/yoroi-classic-theme.inline.svg';
import { ReactComponent as YoroiModernTheme } from '../../../../assets/images/yoroi-modern-theme.inline.svg';
import environment from '../../../../environment';
import globalMessages from '../../../../i18n/global-messages';
import { THEMES } from '../../../../styles/themes';
import ThemeToggler from '../../themeToggler';

const messages = defineMessages({
  themeLabel: {
    id: 'settings.display.themeLabel',
    defaultMessage: '!!!Theme',
  },
  themeExportButton: {
    id: 'settings.display.themeExportButton',
    defaultMessage: '!!!EXPORT THEME',
  },
  themeYoroiClassic: {
    id: 'settings.display.themeNames.yoroiClassic',
    defaultMessage: '!!!Yoroi classic',
  },
  themeYoroiModern: {
    id: 'settings.display.themeNames.yoroiModern',
    defaultMessage: '!!!Yoroi modern',
  },
  themeWarning: {
    id: 'settings.display.themeWarning',
    defaultMessage: '!!!CHANGING THEME WILL REMOVE CUSTOMIZATION',
  },
  themeNote: {
    id: 'settings.display.themeNote',
    defaultMessage: '!!!Note: Changing theme will remove customization.',
  },
  blog: {
    id: 'settings.display.blog',
    defaultMessage: '!!!You can read our {blogLink} on how to use this feature.',
  },
  blogLinkUrl: {
    id: 'settings.support.faq.blogLinkUrl',
    defaultMessage: '!!!https://emurgo.io/en/blog/yoroi-custom-themes',
  },
  tryYoroiRevamp: {
    id: 'settings.tryYoroiRevamp',
    defaultMessage: '!!!Try new Yoroi Revamp',
  },
  backYoroiClassic: {
    id: 'settings.backYoroiClassic',
    defaultMessage: '!!!Back to Yoroi Classic',
  },
  version: {
    id: 'settings.theme.version',
    defaultMessage: '!!!Version',
  },
  currentVersion: {
    id: 'settings.theme.currentVersion',
    defaultMessage: '!!!Yoroi old version',
  },
  newVersion: {
    id: 'settings.theme.newVersion',
    defaultMessage: '!!!Yoroi new version',
  },
  selectColorTheme: {
    id: 'settings.theme.selectColorTheme',
    defaultMessage: '!!!Select color theme for old version',
  },
});

type Props = {|
  +currentTheme: Theme,
  +onSubmit: (theme: string) => PossiblyAsync<void>,
  +onExternalLinkClick: MouseEvent => void,
|};

const NEW_THEME = THEMES.YOROI_BASE;
const OLD_THEME = `${THEMES.YOROI_MODERN}-${THEMES.YOROI_CLASSIC}`;
@observer
export default class ThemeSettingsBlock extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { currentTheme, onSubmit, onExternalLinkClick } = this.props;
    const { intl } = this.context;
    const isRevampLayout = currentTheme === THEMES.YOROI_BASE;

    const blogLink = (
      <Typography
        as="a"
        variant="body2"
        href={intl.formatMessage(messages.blogLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
        sx={{
          textDecoration: 'none',
          borderBottom: '1px solid var(--yoroi-palette-gray-800)',
          color: 'var(--yoroi-support-settings-text)',
        }}
      >
        {intl.formatMessage(globalMessages.blogLinkWrapper)}
      </Typography>
    );

    return (
      <Box
        sx={{
          borderTop: !isRevampLayout && '1px solid var(--yoroi-palette-gray-200)',
          pb: '20px',
          mt: isRevampLayout ? '10px' : '0px',
          py: !isRevampLayout && '24px',
        }}
      >
        {/* <Typography
          component="div"
          variant={isRevampLayout ? 'body1' : 'h5'}
          fontWeight={500}
          mb={isRevampLayout ? '0px' : '12px'}
          color="grayscale.900"
        >
          {intl.formatMessage(messages.version)}
        </Typography> */}
        {/* <Box>
          <RadioGroup
            aria-labelledby="theme-switch-buttons"
            value={currentTheme === NEW_THEME ? NEW_THEME : OLD_THEME}
            onChange={e => {
              const theme = e.target.value === NEW_THEME ? NEW_THEME : THEMES.YOROI_MODERN;
              onSubmit(NEW_THEME);
            }}
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <FormControlLabel
              value={NEW_THEME}
              control={
                <Radio
                  sx={{
                    color: 'primary.500',
                  }}
                  size="small"
                />
              }
              label={intl.formatMessage(messages.newVersion)}
              id="switchToNewVersionButton"
            />
            <FormControlLabel
              value={OLD_THEME}
              control={<Radio sx={{ color: 'primary.500' }} size="small" />}
              label={intl.formatMessage(messages.currentVersion)}
              id="switchToOldVersionButton"
              sx={{
                marginRight: '20px',
              }}
            />
          </RadioGroup>
        </Box> */}
        {currentTheme === THEMES.YOROI_BASE && environment.isDev() && (
          <Box sx={{ mt: '20px' }}>
            <ThemeToggler />
          </Box>
        )}
        {currentTheme !== THEMES.YOROI_BASE && (
          <Box>
            <Box sx={{ marginTop: '20px' }}>
              <Typography
                component="div"
                variant="h5"
                sx={{
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: 'var(--yoroi-support-settings-text)',
                  fontSize: '18px',
                }}
              >
                {intl.formatMessage(messages.selectColorTheme)}
              </Typography>
              <Typography
                component="div"
                variant="body2"
                color="var(--yoroi-support-settings-text)"
                sx={{ marginBottom: '2px' }}
              >
                <FormattedHTMLMessage {...messages.themeNote} />
              </Typography>
              <Typography
                component="div"
                variant="body2"
                color="var(--yoroi-support-settings-text)"
              >
                <FormattedMessage {...messages.blog} values={{ blogLink }} />
              </Typography>
            </Box>

            <Box sx={{ marginTop: '16px' }}>
              <RadioGroup
                row
                value={currentTheme}
                onChange={e => {
                  onSubmit(e.target.value);
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    marginRight: '24px',
                  }}
                >
                  <Box>
                    <YoroiModernTheme />
                  </Box>
                  <FormControlLabel
                    value={THEMES.YOROI_MODERN}
                    control={<Radio size="small" />}
                    label="Modern"
                  />
                </Box>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
                >
                  <YoroiClassicTheme />
                  <FormControlLabel
                    value={THEMES.YOROI_CLASSIC}
                    control={<Radio size="small" />}
                    label="classic"
                  />
                </Box>
              </RadioGroup>
            </Box>
          </Box>
        )}
      </Box>
    );
  }
}
