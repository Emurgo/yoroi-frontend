// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import styles from './DisplaySettings.scss';
import SvgInline from 'react-svg-inline';
import themeYoroiClassicPreview from '../../../assets/images/themes/yoroi-classic.inline.svg';
import { THEMES } from '../../../themes/index';
import ThemeThumbnail from './display/ThemeThumbnail';

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
});

type Props = {
  theme: string,
  selectTheme: Function,
  exportTheme: Function,
  getThemeVars: Function
};

@observer
export default class DisplaySettings extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { theme, selectTheme, getThemeVars, exportTheme } = this.props;
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

    return (
      <div className={styles.component}>

        <div className={styles.label}>
          {intl.formatMessage(messages.themeLabel)}
        </div>
        <Button className={exportButtonClasses}
          label={intl.formatMessage(messages.themeExportButton)}
          skin={ButtonSkin}
          onClick={exportTheme.bind(this, {})}
        />
        <div className={styles.themesWrapper}>

          <button
            type="button"
            className={themeYoroiClassicClasses}
            onClick={selectTheme.bind(this, { theme: THEMES.YOROI_CLASSIC })}
          >
            <ThemeThumbnail themeVars={getThemeVars({ theme: THEMES.YOROI_CLASSIC })} />
            <span>{intl.formatMessage(messages.themeYoroiClassic)}</span>
          </button>

          <button
            type="button"
            className={themeYoroiModernClasses}
            onClick={selectTheme.bind(this, { theme: THEMES.YOROI_MODERN })}
          >
            <div>
              {/* <SvgInline svg={themeYoroiClassicPreview} className={styles.icon} cleanup={['title']} /> */}
              <ThemeThumbnail themeVars={getThemeVars({ theme: THEMES.YOROI_MODERN })} />
            </div>
            <span>{intl.formatMessage(messages.themeYoroiModern)}</span>
          </button>

          <button
            type="button"
            className={themeYoroiModernClasses}
            onClick={selectTheme.bind(this, { theme: THEMES.YOROI_MODERN })}
          >
            <div>
              {/* <SvgInline svg={themeYoroiClassicPreview} className={styles.icon} cleanup={['title']} /> */}
              <ThemeThumbnail themeVars={getThemeVars({ theme: THEMES.YOROI_MODERN })} />
            </div>
            <span>{intl.formatMessage(messages.themeYoroiModern)}</span>
          </button>

          <button
            type="button"
            className={themeYoroiModernClasses}
            onClick={selectTheme.bind(this, { theme: THEMES.YOROI_MODERN })}
          >
            <div>
              {/* <SvgInline svg={themeYoroiClassicPreview} className={styles.icon} cleanup={['title']} /> */}
              <ThemeThumbnail themeVars={getThemeVars({ theme: THEMES.YOROI_MODERN })} />
            </div>
            <span>{intl.formatMessage(messages.themeYoroiModern)}</span>
          </button>
        </div>

      </div>
    );
  }

}
