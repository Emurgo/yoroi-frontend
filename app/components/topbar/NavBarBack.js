// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './NavBarBack.scss';
import BackIcon from '../../assets/images/wallet-nav/back-arrow.inline.svg';

type Props = {|
  +title: string,
  +onBackClick: string => void,
  +route: string,
|};

@observer
export default class NavBarBack extends Component<Props> {

  render(): Node {
    const { title, onBackClick, route } = this.props;

    return (
      <button
        type="button"
        className={styles.backButton}
        onClick={() => onBackClick(route)}
      >
        <span className={styles.backIcon}>
          <BackIcon />
        </span>
        {title}
      </button>
    );
  }
}
