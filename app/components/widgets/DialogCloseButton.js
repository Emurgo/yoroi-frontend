// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import CloseCross from '../../assets/images/close-cross.inline.svg';
import styles from './DialogCloseButton.scss';

type Props = {|
  +onClose?: void => PossiblyAsync<void>,
  +icon?: ?string,
|};

@observer
export default class DialogCloseButton extends Component<Props> {
  static defaultProps = {
    onClose: undefined,
    icon: null
  };

  render() {
    const { onClose, icon } = this.props;
    const Svg = (icon != null && icon !== '')
      ? icon
      : CloseCross;
    return (
      <button tabIndex="-1" type="button" onClick={onClose} className={styles.component}>
        <Svg />
      </button>
    );
  }
}
