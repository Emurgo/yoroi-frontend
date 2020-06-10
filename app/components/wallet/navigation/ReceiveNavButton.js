// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './ReceiveNavButton.scss';

type Props = {|
  +label: string,
  +isActive: boolean,
  +onClick: void => void,
  +className?: string,
  +icon?: string,
|};

@observer
export default class ReceiveNavButton extends Component<Props> {
  static defaultProps: {|className: void, icon: void|} = {
    className: undefined,
    icon: undefined,
  };

  render(): Node {
    const { isActive, onClick, className, label } = this.props;

    const componentClasses = classnames([
      className,
      styles.wrapper,
      isActive && styles.active
    ]);

    const IconComponent = this.props.icon;

    return (
      <div className={componentClasses}>
        <button type="button" className={styles.button} onClick={onClick}>
          <span className={styles.label}>{label}</span>
        </button>
        {IconComponent != null &&
          <div className={styles.icon}>
            <IconComponent />
          </div>
        }
      </div>
    );
  }
}
