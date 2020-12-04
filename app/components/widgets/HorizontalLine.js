// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './HorizontalLine.scss';

type Props = {||};

@observer
export default class FlagLabel extends Component<Props> {

  render(): Node {
    return (
      <hr className={styles.fullWidth} />
    );
  }
}
