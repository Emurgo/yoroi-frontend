// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Button, FormControlLabel, IconButton, Radio, RadioGroup, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import { defineMessages, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { THEMES } from '../../../../styles/utils';
import type { Theme } from '../../../../styles/utils';
import ThemeThumbnail from '../display/ThemeThumbnail';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { withLayout } from '../../../../styles/context/layout';
import type { LayoutComponentMap } from '../../../../styles/context/layout';
import environment from '../../../../environment';
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
  +exportTheme: void => PossiblyAsync<void>,
  +hasCustomTheme: void => boolean,
  +onExternalLinkClick: MouseEvent => void,
  +switchToFirstWallet: void => void,
|};
type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};
type AllProps = {| ...Props, ...InjectedProps |};

const NEW_THEME = THEMES.YOROI_REVAMP
const OLD_THEME = `${THEMES.YOROI_MODERN}-${THEMES.YOROI_CLASSIC}`
@observer
class ThemeSettingsBlock extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      currentTheme,
      selectTheme,
      exportTheme,
      hasCustomTheme,
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

    const commonHeader = (
      <>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 500,
            marginBottom: '12px',
            color: 'var(--yoroi-support-settings-text)',
          }}
        >
          {intl.formatMessage(messages.themeLabel)}
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
      </>
    );

    const shouldDisplayRevampButton = environment.isDev()
      || environment.isNightly()
      || environment.isTest();

    const themeBlockClassicComponent = (
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
              control={<Radio size='small' />}
              label={intl.formatMessage(messages.newVersion)}
            />
          </RadioGroup>
        </Box>
        <Box sx={{ marginTop: '20px' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              marginBottom: '8px',
              color: 'var(--yoroi-support-settings-text)',
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
        {/* {commonHeader}
        <Box sx={{ maxWidth: '1300px', textAlign: 'center', marginTop: '20px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <ThemeButton
              variant={null}
              onClick={selectTheme.bind(this, { theme: THEMES.YOROI_MODERN })}
              isActive={currentTheme === THEMES.YOROI_MODERN}
            >
              {currentTheme === THEMES.YOROI_MODERN && hasCustomTheme() && (
                <WarningMessage variant="body2">
                  {intl.formatMessage(messages.themeWarning)}
                </WarningMessage>
              )}
              <ThemeThumbnail theme={THEMES.YOROI_MODERN} themeKey="modern" />
              <Typography
                variant="body2"
                sx={{ textalign: 'center', color: 'var(--yoroi-support-settings-text)' }}
              >
                {intl.formatMessage(messages.themeYoroiModern)}
              </Typography>
            </ThemeButton>
            <ThemeButton
              variant={null}
              isActive={currentTheme === THEMES.YOROI_CLASSIC}
              onClick={selectTheme.bind(this, { theme: THEMES.YOROI_CLASSIC })}
            >
              {currentTheme === THEMES.YOROI_CLASSIC && hasCustomTheme() && (
                <WarningMessage variant="body2">
                  {intl.formatMessage(messages.themeWarning)}
                </WarningMessage>
              )}
              <ThemeThumbnail theme={THEMES.YOROI_CLASSIC} themeKey="classic" />
              <Typography sx={{ textalign: 'center', color: 'var(--yoroi-support-settings-text)' }}>
                {intl.formatMessage(messages.themeYoroiClassic)}
              </Typography>
            </ThemeButton>
          </Box>

          <Button variant="primary" onClick={exportTheme.bind(this)} sx={{ width: '400px' }}>
            {intl.formatMessage(messages.themeExportButton)}
          </Button>
        </Box>

        {shouldDisplayRevampButton && (
          <Box sx={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
            <Button
              sx={{
                width: '400px',
                background: 'white',
                color: '#6b7384',
                border: '1px solid #6b7384',
                '&:hover': {
                  color: '#383838',
                  background: 'white',
                },
                position: 'relative',
                '&::after': {
                  content: '"new"',
                  top: '50%',
                  right: '30px',
                  transform: 'translateY(-50%)',
                  position: 'absolute',
                  color: 'var(--yoroi-comp-button-primary-text)',
                  backgroundColor: 'var(--yoroi-comp-button-primary-background)',
                  padding: '4px 10px',
                  borderRadius: '777px',
                },
              }}
              onClick={() => {
                selectTheme({ theme: THEMES.YOROI_REVAMP });
                this.props.switchToFirstWallet();
              }}
              id='switchToRevampButton'
            >
              {intl.formatMessage(messages.tryYoroiRevamp)}
            </Button>
          </Box>
        )} */}
      </Box>
    );

    const themeBlockRevampComponent = (
      <Box sx={{ borderTop: '1px solid var(--yoroi-palette-gray-200)', paddingTop: '30px' }}>
        {commonHeader}
        <Box sx={{ maxWidth: '1300px', textAlign: 'center', marginTop: '20px' }}>
          <Button variant="primary" onClick={exportTheme.bind(this)} sx={{ width: '400px' }}>
            {intl.formatMessage(messages.themeExportButton)}
          </Button>
        </Box>
        {(environment.isNightly() || environment.isTest() || environment.isDev()) && (
          <Box sx={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="ternary"
              onClick={() => {
                selectTheme({ theme: THEMES.YOROI_MODERN });
              }}
              sx={{
                width: '400px',
                minHeight: '52px',
              }}
            >
              {intl.formatMessage(messages.backYoroiClassic)}
            </Button>
          </Box>
        )}
      </Box>
    );
    return this.props.renderLayoutComponent({
      CLASSIC: themeBlockClassicComponent,
      REVAMP: themeBlockRevampComponent,
    });
  }
}
export default (withLayout(ThemeSettingsBlock): ComponentType<Props>);

const WarningMessage = styled(Typography)({
  position: 'absolute',
  top: 'calc(50% - 37px)',
  left: 0,
  backgroundColor: 'var(--yoroi-palette-background-banner-warning)',
  color: 'var(--yoroi-palette-common-white)',
  padding: '10px',
});

const ThemeButton = styled(IconButton)(({ isActive }) => ({
  borderRadius: 0,
  display: 'flex',
  flexDirection: 'column',
  opacity: isActive ? 1 : 0.5,
  svg: {
    width: '300px',
    boxShadow: '0 5px 30px 0px rgba(24, 26, 30, 0.12)',
  },
  marginBottom: '32px',
  ':hover': { background: 'transparent' },
}));
