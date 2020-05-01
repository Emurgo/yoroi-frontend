// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import styles from './FirstRewardTooltip.scss';
import WarningIcon from '../../../../assets/images/dashboard/exclamation-mark.inline.svg';

type Props = {|
  text: string,
|};

@observer
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
