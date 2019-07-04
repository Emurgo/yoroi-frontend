// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import styles from './ThemeSettingsBlock.scss';
import { THEMES } from '../../../../themes';
import type { Theme } from '../../../../themes';
import ThemeThumbnail from '../display/ThemeThumbnail';

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
    defaultMessage: '!!!https://emurgo.io/#/en/blog/yoroi-custom-themes',
  },
  blogLinkWrapper: {
    id: 'settings.support.faq.blogLinkWrapper',
    defaultMessage: '!!!blog post',
  },
});

type Props = {|
  currentTheme: Theme,
  selectTheme: Function,
  exportTheme: Function,
  getThemeVars: Function,
  hasCustomTheme: Function,
  onExternalLinkClick: Function,
|};

@observer
export default class ThemeSettingsBlock extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      currentTheme,
      selectTheme,
      getThemeVars,
      exportTheme,
      hasCustomTheme,
      onExternalLinkClick,
    } = this.props;
    const { intl } = this.context;

    const themeYoroiClassicClasses = classnames([
      currentTheme === THEMES.YOROI_CLASSIC ? styles.active : styles.inactive,
      styles.themeImageWrapper,
    ]);

    const themeYoroiModernClasses = classnames([
      currentTheme === THEMES.YOROI_MODERN ? styles.active : styles.inactive,
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
      <div className={styles.component}>

        <h2 className={styles.title}>
          {intl.formatMessage(messages.themeLabel)}
        </h2>

        <p><FormattedHTMLMessage {...messages.themeNote} /></p>
        <p><FormattedMessage {...messages.blog} values={{ blogLink }} /></p>

        <div className={styles.main}>
          <div className={styles.themesWrapper}>
            {/* Modern Theme */}
            <button
              type="button"
              className={themeYoroiModernClasses}
              onClick={selectTheme.bind(this, { theme: THEMES.YOROI_MODERN })}
            >
              {(currentTheme === THEMES.YOROI_MODERN
                && hasCustomTheme() &&
                  <div className={styles.themeWarning}>
                    {intl.formatMessage(messages.themeWarning)}
                  </div>)
              }
              <ThemeThumbnail themeVars={getThemeVars({ theme: THEMES.YOROI_MODERN })} themeKey="modern" />
              <h3 className={styles.subTitle}>{intl.formatMessage(messages.themeYoroiModern)}</h3>
            </button>
            {/* Classic Theme */}
            <button
              type="button"
              className={themeYoroiClassicClasses}
              onClick={selectTheme.bind(this, { theme: THEMES.YOROI_CLASSIC })}
            >
              {(currentTheme === THEMES.YOROI_CLASSIC
                && hasCustomTheme() &&
                  <div className={styles.themeWarning}>
                    {intl.formatMessage(messages.themeWarning)}
                  </div>)
              }
              <ThemeThumbnail themeVars={getThemeVars({ theme: THEMES.YOROI_CLASSIC })} themeKey="classic" />
              <h3 className={styles.subTitle}>{intl.formatMessage(messages.themeYoroiClassic)}</h3>
            </button>
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
