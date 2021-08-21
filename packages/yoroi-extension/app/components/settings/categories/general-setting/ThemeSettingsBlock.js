// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import styles from './ThemeSettingsBlock.scss';
import { THEMES } from '../../../../themes';
import type { Theme } from '../../../../themes';
import ThemeThumbnail from '../display/ThemeThumbnail';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { withLayout } from '../../../../themes/context/layout';
import type { LayoutComponentMap } from '../../../../themes/context/layout';

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
  +getThemeVars: ({| theme: string |}) => { [key: string]: string, ... },
  +hasCustomTheme: void => boolean,
  +onExternalLinkClick: MouseEvent => void,
|};
type InjectedProps = {|
  +isRevampLayout: string,
  +renderLayoutComponent: LayoutComponentMap => Node,
|};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class ThemeSettingsBlock extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      currentTheme,
      selectTheme,
      getThemeVars,
      exportTheme,
      hasCustomTheme,
      onExternalLinkClick,
      changeLayout,
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

    const exportButtonClasses = classnames(['primary', styles.button]);

    const blogLink = (
      <a
        className={styles.link}
        href={intl.formatMessage(messages.blogLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.blogLinkWrapper)}
      </a>
    );

    const commonHeader = (
      <>
        <h2 className={styles.title}>{intl.formatMessage(messages.themeLabel)}</h2>
        <p>
          <FormattedHTMLMessage {...messages.themeNote} />
        </p>
        <p>
          <FormattedMessage {...messages.blog} values={{ blogLink }} />
        </p>
      </>
    );

    const themeBlockClassicComponent = (
      <div className={styles.component}>
        {commonHeader}
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
              <ThemeThumbnail
                themeVars={getThemeVars({ theme: THEMES.YOROI_MODERN })}
                themeKey="modern"
              />
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
              <ThemeThumbnail
                themeVars={getThemeVars({ theme: THEMES.YOROI_CLASSIC })}
                themeKey="classic"
              />
              <h3 className={styles.subTitle}>{intl.formatMessage(messages.themeYoroiClassic)}</h3>
            </button>
          </div>
          <Button
            className={exportButtonClasses}
            label={intl.formatMessage(messages.themeExportButton)}
            skin={ButtonSkin}
            onClick={exportTheme.bind(this)}
          />
        </div>
        <div className={styles.revampWrapper}>
          <Button
            className={styles.revamp}
            label="Try new Yoroi Revamp"
            skin={ButtonSkin}
            onClick={() => {
              changeLayout();
              selectTheme({ theme: THEMES.YOROI_REVAMP });
            }}
          />
        </div>
      </div>
    );

    const themeBlockRevampComponent = (
      <div className={styles.component}>
        {commonHeader}
        <div className={styles.main}>
          <Button
            className={exportButtonClasses}
            label={intl.formatMessage(messages.themeExportButton)}
            skin={ButtonSkin}
            onClick={exportTheme.bind(this)}
          />
        </div>
        <div className={styles.revampWrapper}>
          <Button
            className={styles.classic}
            label="Back to Yoroi Classic"
            skin={ButtonSkin}
            onClick={() => {
              changeLayout();
              selectTheme({ theme: THEMES.YOROI_MODERN });
            }}
          />
        </div>
      </div>
    );
    return this.props.renderLayoutComponent({
      CLASSIC: themeBlockClassicComponent,
      REVAMP: themeBlockRevampComponent,
    });
  }
}
export default (withLayout(ThemeSettingsBlock): Node);
