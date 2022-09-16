// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { defineMessages, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { THEMES } from '../../../../styles/utils';
import type { Theme } from '../../../../styles/utils';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { ReactComponent as YoroiModernTheme } from '../../../../assets/images/yoroi-modern-theme.inline.svg';
import { ReactComponent as YoroiClassicTheme } from '../../../../assets/images/yoroi-classic-theme.inline.svg';

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
    defaultMessage: '!!!Version'
  },
  currentVersion: {
    id: 'settings.theme.currentVersion',
    defaultMessage: '!!!Yoroi current version'
  },
  newVersion: {
    id: 'settings.theme.newVersion',
    defaultMessage: '!!!Yoroi new version'
  },
  selectColorTheme: {
    id: 'settings.theme.selectColorTheme',
    defaultMessage: '!!!Select color theme for old version'
  },
});

type Props = {|
  +currentTheme: Theme,
  +selectTheme: ({| theme: string |}) => PossiblyAsync<void>,
  +onExternalLinkClick: MouseEvent => void,
  +switchToFirstWallet: void => void,
|};

const NEW_THEME = THEMES.YOROI_REVAMP
const OLD_THEME = `${THEMES.YOROI_MODERN}-${THEMES.YOROI_CLASSIC}`
@observer
export default class ThemeSettingsBlock extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      currentTheme,
      selectTheme,
      onExternalLinkClick,
    } = this.props;
    const { intl } = this.context;

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
      <Box sx={{ borderTop: '1px solid var(--yoroi-palette-gray-200)', paddingY: '24px' }}>
        <Typography color='var(--yoroi-palette-gray-900)' fontSize='18px' fontWeight='500' marginBottom='10px'>
          {intl.formatMessage(messages.version)}
        </Typography>
        <Box>
          <RadioGroup
            aria-labelledby="theme-switch-buttons"
            value={currentTheme === NEW_THEME ? NEW_THEME : OLD_THEME}
            onChange={(e) => {
              const theme = e.target.value === NEW_THEME ? NEW_THEME : THEMES.YOROI_MODERN
              selectTheme({ theme })
            }}
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <FormControlLabel
              value={OLD_THEME}
              control={<Radio size='small' />}
              label={intl.formatMessage(messages.currentVersion)}
              sx={{
                marginRight: '20px'
              }}
            />
            <FormControlLabel
              value={NEW_THEME}
              control={<Radio id="switchToRevampButton" size='small' />}
              label={intl.formatMessage(messages.newVersion)}
            />
          </RadioGroup>
        </Box>
        {
          currentTheme !== THEMES.YOROI_REVAMP && (
            <Box>
              <Box sx={{ marginTop: '20px' }}>
                <Typography
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
                  variant="body2"
                  color="var(--yoroi-support-settings-text)"
                  sx={{ marginBottom: '2px' }}
                >
                  <FormattedHTMLMessage {...messages.themeNote} />
                </Typography>
                <Typography variant="body2" color="var(--yoroi-support-settings-text)">
                  <FormattedMessage {...messages.blog} values={{ blogLink }} />
                </Typography>
              </Box>

              <Box sx={{ marginTop: '16px' }}>
                <RadioGroup
                  row
                  value={currentTheme}
                  onChange={(e) => {
                    selectTheme({ theme: e.target.value })
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginRight: '24px' }}>
                    <Box>
                      <YoroiModernTheme />
                    </Box>
                    <FormControlLabel value={THEMES.YOROI_MODERN} control={<Radio size='small' />} label='Modern' />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <YoroiClassicTheme />
                    <FormControlLabel value={THEMES.YOROI_CLASSIC} control={<Radio size='small' />} label='classic' />
                  </Box>
                </RadioGroup>
              </Box>
            </Box>
          )
        }
      </Box>
    )
  }
}