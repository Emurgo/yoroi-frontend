// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import styles from './ProgressCircle.scss';

type Props = {|
  percentage: number,
  text?: string | null,
  variant: string,
|};

@observer
export default class ProgressCircle extends Component<Props> {
  static defaultProps = {
    text: null,
  };
  render() {
    const { percentage, text, variant } = this.props;
    return (
      <div className={classnames(styles.wrapper, styles[`${variant}`])}>
        <div
          className={
            text === null ?
              classnames(styles.textWrapper, styles.bold)
              : styles.textWrapper
          }
        >
          {percentage}%
          {text !== null && <p className={styles.text}>{text}</p>}
        </div>
        <svg viewBox="0 0 36 36" className={styles.chart}>
          <path
            className={classnames(styles.circle, styles.baseCircle)}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={styles.circle}
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </div>
    );
  }

}
