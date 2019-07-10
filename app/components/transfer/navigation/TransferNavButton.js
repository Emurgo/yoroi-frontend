// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './TransferNavButton.scss';

type Props = {|
  label: string,
  isActive: boolean,
  onClick: Function,
  className?: string,
|};

@observer
export default class TransferNavButton extends Component<Props> {
  static defaultProps = {
    className: undefined
  };

  render() {
    const { isActive, onClick, className, label } = this.props;
    const componentClasses = classnames([
      className,
      styles.component,
      isActive ? styles.active : styles.normal
    ]);
    return (
      <button type="button" className={componentClasses} onClick={onClick}>
        <div className={styles.container}>
          <span className={styles.label}>{label}</span>
        </div>
      </button>
    );
  }
}
