// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './StaticTopbarTitle.scss';

type Props = {|
  +title: string,
|};

/** Static text styled for the center-text of a topbar */
@observer
export default class StaticTopbarTitle extends Component<Props> {
  render() {
    const { title } = this.props;

    return (
      <div className={styles.topBarTitle}>
        <div className={styles.topbarTitleContainer}>
          <div className={styles.topbarTitleText}>{title}</div>
        </div>
      </div>
    );
  }
}
