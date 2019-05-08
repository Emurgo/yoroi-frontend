// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SettingsMenuItem.scss';
import { THEMES } from '../../../themes';
import type { Theme } from '../../../themes';

type Props = {
  label: string,
  active: boolean,
  onClick: Function,
  className: string,
  disabled?: boolean,
  currentTheme: Theme,
};

@observer
export default class SettingsMenuItem extends Component<Props> {
  static defaultProps = {
    disabled: false
  };

  render() {
    const { label, active, disabled, onClick, className, currentTheme } = this.props;
    let state = styles.enabled;
    if (disabled) {
      state = styles.disabled;
    } else if (active) {
      state = styles.active;
    }
    const componentClasses = classNames([
      currentTheme === THEMES.YOROI_CLASSIC ? styles.componentClassic : styles.component,
      state,
      className
    ]);

    return (
      <button type="button" className={componentClasses} onClick={onClick}>{label}</button>
    );
  }

}
