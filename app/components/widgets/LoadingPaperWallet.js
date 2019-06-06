// @flow
import React, { Component } from 'react';
import styles from './LoadingPaperWallet.scss';

export default class LoadingPaperWallet extends Component<any> {

  root: ?HTMLElement;

  render() {
    return <div className={styles.component} ref={(div) => { this.root = div; }} />;
  }
}
