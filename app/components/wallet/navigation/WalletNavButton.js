// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './WalletNavButton.scss';

type Props = {
  label: string,
  icon: string,
  isActive: boolean,
  onClick: Function,
  className?: string,
  classicTheme: boolean
};

@observer
export default class WalletNavButton extends Component<Props> {
  static defaultProps = {
    className: undefined
  };

  render() {
    const { isActive, onClick, className, classicTheme } = this.props;
    const componentClasses = classnames([
      className,
      styles.component,
      isActive ? styles.active : styles.normal
    ]);
    const labelClasses = classicTheme ? styles.labelClassic : styles.label;
    return (
      <button type="button" className={componentClasses} onClick={onClick}>
        <div className={styles.container}>
          <span className={labelClasses}>{this.props.label}</span>
        </div>
      </button>
    );
  }
}
