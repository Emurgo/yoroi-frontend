// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './BigButtonForDialogs.scss';

type Props = {|
  +label: string,
  +description: string,
  +onClick: Function,
  +isDisabled: boolean,
  +className: string,
|};

export default class BigButtonForDialogs extends Component<Props> {

  render() {
    const { label, description, onClick, isDisabled = false, className } = this.props;
    const componentClasses = classnames([
      className,
      styles.component,
      isDisabled ? styles.disabled : null
    ]);
    return (
      <button
        type="button"
        className={componentClasses}
        onClick={onClick}
        disabled={isDisabled}
      >
        <div className={styles.label}>{label}</div>
        <div className={styles.description}>{description}</div>
      </button>
    );
  }
}
