// @flow
import { Component } from 'react';
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
  +isToplevel?: boolean,
  +tooltip?: Node,
|};

@observer
export default class ReceiveNavButton extends Component<Props> {
  static defaultProps: {| className: void, icon: void, isToplevel:void, tooltip: void |} = {
    className: undefined,
    icon: undefined,
    isToplevel: undefined,
    tooltip: undefined,
  };

  renderButton: void => Node = () => {
    const buttonClass = classnames([
      styles.button,
      this.props.isToplevel === true
        ? styles.topLevel
        : styles.notTopLevel,
    ]);

    if (this.props.tooltip == null) {
      return (
        <button type="button" className={buttonClass} onClick={this.props.onClick}>
          <span className={styles.label}>{this.props.label}</span>
        </button>
      );
    }
    return (
      <button type="button" className={buttonClass} onClick={this.props.onClick}>
        <div className={styles.label}>
          {this.props.label}
          {this.props.tooltip}
        </div>
      </button>
    );
  }

  render(): Node {
    const componentClasses = classnames([
      this.props.className,
      styles.wrapper,
      this.props.isActive && styles.active,
    ]);

    const IconComponent = this.props.icon;

    return (
      <div className={componentClasses}>
        {this.renderButton()}
        {IconComponent != null &&
          <div className={styles.icon}>
            <IconComponent />
          </div>
        }
      </div>
    );
  }
}
