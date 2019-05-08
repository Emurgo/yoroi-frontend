// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './SettingsLayout.scss';
import { THEMES } from '../../themes';
import type { Theme } from '../../themes';

type Props = {
  children: Node,
  menu: Node,
  currentTheme: Theme,
};

@observer
export default class SettingsLayout extends Component<Props> {
  render() {
    const { menu, children, currentTheme } = this.props;
    return (
      <div className={currentTheme === THEMES.YOROI_CLASSIC ? styles.componentClassic : styles.component}>
        <div
          className={currentTheme === THEMES.YOROI_CLASSIC ? styles.settingsPaneWrapperClassic : styles.settingsPaneWrapper}
        >
          <div className={currentTheme === THEMES.YOROI_CLASSIC ? styles.settingsPaneClassic : styles.settingsPane}>
            {children}
          </div>
        </div>
        {menu}
      </div>
    );
  }
}
