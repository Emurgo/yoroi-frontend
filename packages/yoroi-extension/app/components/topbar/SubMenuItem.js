// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SubMenuItem.scss';

type Props = {|
  +label: string,
  +active: boolean,
  +onClick: void => void,
  +className: string,
  +disabled?: boolean,
|};

@observer
export default class SubMenuItem extends Component<Props> {
  static defaultProps: {| disabled: boolean |} = {
    disabled: false,
  };

  render(): Node {
    const { label, active, disabled, onClick, className } = this.props;
    let state = styles.enabled;
    if (disabled === true) {
      state = styles.disabled;
    } else if (active) {
      state = styles.active;
    }
    const componentClasses = classNames([styles.component, state, className]);

    return (
      <button type="button" className={componentClasses} disabled={disabled} onClick={onClick}>
        {label}
      </button>
    );
  }
}
