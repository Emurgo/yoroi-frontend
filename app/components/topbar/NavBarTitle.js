// @flow
import React, { Component } from 'react';
import styles from './NavBarTitle.scss';

type Props = {|
  +title: string,
|};

export default class NavBarTitle extends Component<Props> {
  render() {
    const { title } = this.props;

    return (
      <div className={styles.title}>{title}</div>
    );
  }
}
