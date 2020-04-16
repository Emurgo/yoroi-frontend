// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SettingsMenuItem.scss';

type Props = {|
  +label: string,
  +active: boolean,
  +onClick: void => void,
  +className: string,
  +disabled?: boolean,
|};

@observer
export default class SettingsMenuItem extends Component<Props> {
  static defaultProps = {
    disabled: false
  };

  render() {
    const { label, active, disabled, onClick, className } = this.props;
    let state = styles.enabled;
    if (disabled === true) {
      state = styles.disabled;
    } else if (active) {
      state = styles.active;
    }
    const componentClasses = classNames([
      styles.component,
      state,
      className
    ]);

    const disableClick = active || (disabled === true);
    return (
      <button type="button" className={componentClasses} onClick={disableClick ? () => {} : onClick}>{label}</button>
    );
  }

}
