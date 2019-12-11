// @flow
import React, { Component } from 'react';
import type { Node } from 'react';

import styles from './Card.scss';

type Props = {|
  children?: Node,
  title?: string,
|};

export default class Card extends Component<Props> {

  static defaultProps = {
    children: undefined,
    title: undefined,
  };

  render() {
    const { title, children } = this.props;
    return (
      <div className={styles.wrapper}>
        {title !== undefined &&
          <h2 className={styles.title}>
            {title}
          </h2>
        }
        <div className={styles.inner}>
          {children}
        </div>
      </div>
    );
  }
}
