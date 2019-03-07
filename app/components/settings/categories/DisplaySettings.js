// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import styles from './DisplaySettings.scss';
import { THEMES } from '../../../themes/index';
import ThemeThumbnail from './display/ThemeThumbnail';
import environment from '../../../environment';

const messages = defineMessages({
  themeLabel: {
    id: 'settings.display.themeLabel',
    defaultMessage: '!!!Theme',
    description: 'Label for the "Theme" selection on the display settings page.',
  },
  themeExportButton: {
    id: 'settings.display.themeExportButton',
    defaultMessage: '!!!EXPORT THEME',
    description: 'Label for the "Export Theme" button.'
  },
  themeYoroiClassic: {
    id: 'settings.display.themeNames.yoroiClassic',
    defaultMessage: '!!!Yoroi classic',
    description: 'Name of the "Yoroi classic" theme on the display settings page.',
  },
  themeYoroiModern: {
    id: 'settings.display.themeNames.yoroiModern',
    defaultMessage: '!!!Yoroi modern',
    description: 'Name of the "Yoroi modern" theme on the display settings page.',
  },
  themeWarning: {
    id: 'settings.display.themeWarning',
    defaultMessage: '!!!CHANGING THEME WILL REMOVE CUSTOMIZATION',
    description: 'Label for the "CHANGING THEME WILL REMOVE CUSTOMIZATION" message.',
  },
  blog: {
    id: 'settings.display.blog',
    defaultMessage: '!!!You can read our {blogLink} on how to use this feature.',
    description: 'text to introduce blog post',
  },
  blogLinkUrl: {
    id: 'settings.support.faq.blogLinkUrl',
    defaultMessage: '!!!https://medium.com/@emurgo_io/custom-themes-in-yoroi-d3fa93f4b926',
    description: 'link for blog post',
  },
  blogLinkWrapper: {
    id: 'settings.support.faq.blogLinkWrapper',
    defaultMessage: '!!!blog post',
    description: 'clickable text to open link',
  },
});

type Props = {
  theme: string,
  selectTheme: Function,
  exportTheme: Function,
  getThemeVars: Function,
  hasCustomTheme: Function,
  onExternalLinkClick: Function,
};

@observer
export default class DisplaySettings extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      theme,
      selectTheme,
      getThemeVars,
      exportTheme,
      hasCustomTheme,
      onExternalLinkClick 
    } = this.props;
    const { intl } = this.context;

    const themeYoroiClassicClasses = classnames([
      theme === THEMES.YOROI_CLASSIC ? styles.active : styles.inactive,
      styles.themeImageWrapper,
    ]);

    const themeYoroiModernClasses = classnames([
      theme === THEMES.YOROI_MODERN ? styles.active : styles.inactive,
      styles.themeImageWrapper,
    ]);

    const exportButtonClasses = classnames([
      styles.exportStyleButton,
      'primary',
      styles.button,
    ]);

    const blogLink = (
      <a
        href={intl.formatMessage(messages.blogLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
      >
        {intl.formatMessage(messages.blogLinkWrapper)}
      </a>
    );

    return (
      <div className={styles.component}>

        <div className={styles.label}>
          {intl.formatMessage(messages.themeLabel)}
        </div>

        <p><FormattedMessage {...messages.blog} values={{ blogLink }} /></p><br />

        <Button
          className={exportButtonClasses}
          label={intl.formatMessage(messages.themeExportButton)}
          skin={ButtonSkin}
          onClick={exportTheme.bind(this, {})}
        />
        <div className={styles.themesWrapper}>
          {/* @Todo: Theme Preview Enumeration should be more dynamic? */}
          <button
            type="button"
            className={themeYoroiClassicClasses}
            onClick={selectTheme.bind(this, { theme: THEMES.YOROI_CLASSIC })}
          >
            {(theme === THEMES.YOROI_CLASSIC
              && hasCustomTheme() &&
                <div className={styles.themeWarning}>
                  {intl.formatMessage(messages.themeWarning)}
                </div>)
            }
            <ThemeThumbnail themeVars={getThemeVars({ theme: THEMES.YOROI_CLASSIC })} />
            <span>{intl.formatMessage(messages.themeYoroiClassic)}</span>
          </button>

          {!environment.isMainnet() && // a second theme to allow testing switching themes
            (
              <button
                type="button"
                className={themeYoroiModernClasses}
                onClick={selectTheme.bind(this, { theme: THEMES.YOROI_MODERN })}
              >
                {(theme === THEMES.YOROI_MODERN
                  && hasCustomTheme() &&
                    <div className={styles.themeWarning}>
                      {intl.formatMessage(messages.themeWarning)}
                    </div>)
                }
                <ThemeThumbnail themeVars={getThemeVars({ theme: THEMES.YOROI_MODERN })} />
                <span>{intl.formatMessage(messages.themeYoroiModern)}</span>
              </button>
            )
          }
        </div>

      </div>
    );
  }

}
