// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './SettingsLayout.scss';

type Props = {
  children: Node,
  menu: Node,
  isClassicThemeActive: boolean,
};

@observer
export default class SettingsLayout extends Component<Props> {
  render() {
    const { menu, children, isClassicThemeActive } = this.props;
    return (
      <div className={isClassicThemeActive ? styles.componentClassic : styles.component}>
        <div
          className={isClassicThemeActive ?
            styles.settingsPaneWrapperClassic :
            styles.settingsPaneWrapper}
        >
          <div className={isClassicThemeActive ? styles.settingsPaneClassic : styles.settingsPane}>
            {children}
          </div>
        </div>
        {menu}
      </div>
    );
  }
}
