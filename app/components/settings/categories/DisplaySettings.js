// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import styles from './DisplaySettings.scss';
import { THEMES } from '../../../types/ThemeType';
import ThemeThumbnail from './display/ThemeThumbnail';
import environment from '../../../environment';

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
  blog: {
    id: 'settings.display.blog',
    defaultMessage: '!!!You can read our {blogLink} on how to use this feature.',
  },
  blogLinkUrl: {
    id: 'settings.support.faq.blogLinkUrl',
    defaultMessage: '!!!https://emurgo.io/#/en/blog/yoroi-custom-themes',
  },
  blogLinkWrapper: {
    id: 'settings.support.faq.blogLinkWrapper',
    defaultMessage: '!!!blog post',
  },
});

type Props = {
  theme: string,
  selectTheme: Function,
  exportTheme: Function,
  getThemeVars: Function,
  hasCustomTheme: Function,
  onExternalLinkClick: Function,
  isClassicThemeActive: boolean,
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
      onExternalLinkClick,
      isClassicThemeActive,
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
      <div className={isClassicThemeActive ? styles.componentClassic : styles.component}>

        <div className={styles.label}>
          {intl.formatMessage(messages.themeLabel)}
        </div>

        <p><FormattedMessage {...messages.blog} values={{ blogLink }} /></p>

        <div className={styles.main}>
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
          <Button
            className={exportButtonClasses}
            label={intl.formatMessage(messages.themeExportButton)}
            skin={ButtonSkin}
            onClick={exportTheme.bind(this, {})}
          />
        </div>

      </div>
    );
  }

}
