// @flow
import React, { Component } from 'react';
import BackArrow from '../../assets/images/back-arrow-ic.inline.svg';
import styles from './DialogBackButton.scss';

type Props = {|
  +onBack: void => void
|};

export default class DialogBackButton extends Component<Props> {

  render() {
    const { onBack } = this.props;
    return (
      <button tabIndex="-1" type="button" onClick={onBack} className={styles.component}>
        <BackArrow />
      </button>
    );
  }
}
