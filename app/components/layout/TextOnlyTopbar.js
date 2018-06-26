// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import Wallet from '../../domain/Wallet';
import styles from './TextOnlyTopbar.scss';

type Props = {
  title: string,
};

export default class TextOnlyTopBar extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

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
