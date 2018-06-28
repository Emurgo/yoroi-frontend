// @flow
import React, { Component } from 'react';
import classNames from 'classnames';
import styles from './TextOnlyTopbar.scss';

type Props = {
  title: string,
};

export default class TextOnlyTopBar extends Component<Props> {

  render() {
    const { title } = this.props;
    const topBarStyles = classNames([
      styles.topBar
    ]);

    return (
      <header className={topBarStyles}>
        <div className={styles.topBarTitle}>
          <div className={styles.topbarTitleContainer}>
            <div className={styles.topbarTitleText}>{title}</div>
          </div>
        </div>
      </header>
    );
  }
}
