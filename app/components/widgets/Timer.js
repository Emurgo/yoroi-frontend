// @flow
import React, { Component } from 'react';
import styles from './Timer.scss';

type Props = {|
  time: {|
    +h: string,
    +m: string,
    +s: string,
  |},
|};

export default class Timer extends Component<Props> {

  render() {
    return (
      <div className={styles.timer}>
        <span className={styles.timeBlock}>{this.props.time.h}</span>
        :
        <span className={styles.timeBlock}>{this.props.time.m}</span>
        :
        <span className={styles.timeBlock}>{this.props.time.s}</span>
      </div>
    );
  }
}
