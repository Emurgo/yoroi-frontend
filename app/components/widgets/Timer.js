// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './Timer.scss';

type Props = {|
  time: {|
    +d?: string,
    +h: string,
    +m: string,
    +s: string,
  |},
|};

@observer
export default class Timer extends Component<Props> {

  render(): Node {
    return (
      <div className={styles.timer}>
        {this.props.time.d != null
          ? <span className={styles.timeBlock}>{this.props.time.d}</span>
          : null}
        <span className={styles.timeBlock}>{this.props.time.h}</span>
        :
        <span className={styles.timeBlock}>{this.props.time.m}</span>
        :
        <span className={styles.timeBlock}>{this.props.time.s}</span>
      </div>
    );
  }
}
