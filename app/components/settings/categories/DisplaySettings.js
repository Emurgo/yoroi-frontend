// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './DisplaySettings.scss';
import SvgInline from 'react-svg-inline';
import themeYoroiClassicPreview from '../../../assets/images/themes/yoroi-classic.inline.svg';
import { THEMES } from '../../../themes/index';

const messages = defineMessages({
  themeLabel: {
    id: 'settings.display.themeLabel',
    defaultMessage: '!!!Theme',
    description: 'Label for the "Theme" selection on the display settings page.',
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
};

@observer
export default class DisplaySettings extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { theme, selectTheme } = this.props;
    const { intl } = this.context;

    const themeYoroiClassicClasses = classnames([
      theme === THEMES.YOROI_CLASSIC ? styles.active : styles.inactive,
      styles.themeImageWrapper,
    ]);

    const themeYoroiModernClasses = classnames([
      theme === THEMES.YOROI_MODERN ? styles.active : styles.inactive,
      styles.themeImageWrapper,
    ]);

    return (
      <div className={styles.component}>

        <div className={styles.label}>
          {intl.formatMessage(messages.themeLabel)}
        </div>

        <div className={styles.themesWrapper}>

          <button
            type="button"
            className={themeYoroiClassicClasses}
            onClick={selectTheme.bind(this, { theme: THEMES.YOROI_CLASSIC })}
          >
            <div><SvgInline svg={themeYoroiClassicPreview} className={styles.icon} cleanup={['title']} /></div>
            <span>{intl.formatMessage(messages.themeYoroiClassic)}</span>
          </button>

          <button
            type="button"
            className={themeYoroiModernClasses}
            onClick={selectTheme.bind(this, { theme: THEMES.YOROI_MODERN })}
          >
            { /* TODO: replace with picture of new theme once we have one */ }
            <div><SvgInline svg={themeYoroiClassicPreview} className={styles.icon} cleanup={['title']} /></div>
            <span>{intl.formatMessage(messages.themeYoroiModern)}</span>
          </button>

        </div>

      </div>
    );
  }

}
