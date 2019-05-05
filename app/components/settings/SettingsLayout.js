// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './SettingsLayout.scss';

type Props = {
  children: Node,
  menu: Node,
  classicTheme: boolean,
};

@observer
export default class SettingsLayout extends Component<Props> {
  render() {
    const { menu, children, classicTheme } = this.props;
    return (
      <div className={classicTheme ? styles.componentClassic : styles.component}>
        <div
          className={classicTheme ? styles.settingsPaneWrapperClassic : styles.settingsPaneWrapper}
        >
          <div className={classicTheme ? styles.settingsPaneClassic : styles.settingsPane}>
            {children}
          </div>
        </div>
        {menu}
      </div>
    );
  }
}
