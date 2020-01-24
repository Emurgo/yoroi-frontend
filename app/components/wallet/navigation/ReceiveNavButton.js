// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './ReceiveNavButton.scss';

type Props = {|
  +label: string,
  +isActive: boolean,
  +onClick: void => void,
  +className?: string,
  +icon: string, // TODO: make use of this?
|};

@observer
export default class ReceiveNavButton extends Component<Props> {
  static defaultProps = {
    className: undefined,
  };

  render() {
    const { isActive, onClick, className, label } = this.props;

    const componentClasses = classnames([
      className,
      styles.button,
      isActive && styles.active
    ]);

    return (
      <button type="button" className={componentClasses} onClick={onClick}>
        <span className={styles.label}>{label}</span>
      </button>
    );
  }
}
