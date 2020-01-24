// @flow
import React, { Component } from 'react';

import styles from './FirstRewardTooltip.scss';
import WarningIcon from '../../../../assets/images/dashboard/exclamation-mark.inline.svg';

type Props = {|
  text: string,
|};

export default class FirstRewardTooltip extends Component<Props> {
  render() {
    const { text } = this.props;
    return (
      <div className={styles.wrapper}>
        <div className={styles.icon}>
          <WarningIcon />
        </div>
        <div className={styles.content}>
          {text}
        </div>
      </div>
    );
  }
}
