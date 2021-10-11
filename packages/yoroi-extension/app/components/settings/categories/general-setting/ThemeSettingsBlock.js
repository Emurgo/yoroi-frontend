// @flow
import { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import { defineMessages, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import styles from './ThemeSettingsBlock.scss';
import { THEMES } from '../../../../themes';
import type { Theme } from '../../../../themes';
import ThemeThumbnail from '../display/ThemeThumbnail';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';

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
});

type Props = {|
  +currentTheme: Theme,
  +selectTheme: ({| theme: string |}) => PossiblyAsync<void>,
  +exportTheme: void => PossiblyAsync<void>,
  +hasCustomTheme: void => boolean,
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class ThemeSettingsBlock extends Component<Props> {
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

    const themeYoroiClassicClasses = classnames([
      currentTheme === THEMES.YOROI_CLASSIC ? styles.active : styles.inactive,
      styles.themeImageWrapper,
    ]);

    const themeYoroiModernClasses = classnames([
      currentTheme === THEMES.YOROI_MODERN ? styles.active : styles.inactive,
      styles.themeImageWrapper,
    ]);

    const blogLink = (
      <a
        className={styles.link}
        href={intl.formatMessage(messages.blogLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.blogLinkWrapper)}
      </a>
    );

    return (
      <div className={styles.component}>
        <h2 className={styles.title}>{intl.formatMessage(messages.themeLabel)}</h2>

        <p>
          <FormattedHTMLMessage {...messages.themeNote} />
        </p>
        <p>
          <FormattedMessage {...messages.blog} values={{ blogLink }} />
        </p>

        <div className={styles.main}>
          <div className={styles.themesWrapper}>
            {/* Modern Theme */}
            <button
              type="button"
              className={themeYoroiModernClasses}
              onClick={selectTheme.bind(this, { theme: THEMES.YOROI_MODERN })}
            >
              {currentTheme === THEMES.YOROI_MODERN && hasCustomTheme() && (
                <div className={styles.themeWarning}>
                  {intl.formatMessage(messages.themeWarning)}
                </div>
              )}
              <ThemeThumbnail theme={THEMES.YOROI_MODERN} themeKey="modern" />
              <h3 className={styles.subTitle}>{intl.formatMessage(messages.themeYoroiModern)}</h3>
            </button>
            {/* Classic Theme */}
            <button
              type="button"
              className={themeYoroiClassicClasses}
              onClick={selectTheme.bind(this, { theme: THEMES.YOROI_CLASSIC })}
            >
              {currentTheme === THEMES.YOROI_CLASSIC && hasCustomTheme() && (
                <div className={styles.themeWarning}>
                  {intl.formatMessage(messages.themeWarning)}
                </div>
              )}
              <ThemeThumbnail theme={THEMES.YOROI_CLASSIC} themeKey="classic" />
              <h3 className={styles.subTitle}>{intl.formatMessage(messages.themeYoroiClassic)}</h3>
            </button>
          </div>

          <Button variant="primary" onClick={exportTheme.bind(this)} sx={{ width: '400px' }}>
            {intl.formatMessage(messages.themeExportButton)}
          </Button>
        </div>
      </div>
    );
  }
}
