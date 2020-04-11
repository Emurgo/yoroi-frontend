// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './WalletNavButton.scss';

type Props = {|
  +label: string,
  +icon?: string,
  +isActive: boolean,
  +onClick: void => void,
  +className?: string,
|};

@observer
export default class WalletNavButton extends Component<Props> {
  static defaultProps = {
    className: undefined,
    icon: undefined
  };

  render() {
    const { isActive, onClick, className, label, icon } = this.props;

    const IconComponent = icon;

    const componentClasses = classnames([
      className,
      styles.button,
      isActive && styles.active
    ]);

    return (
      <button type="button" className={componentClasses} onClick={onClick}>
        {IconComponent != null &&
          <div className={styles.icon}>
            <IconComponent />
          </div>
        }
        <span className={styles.label}>{label}</span>
      </button>
    );
  }
}
