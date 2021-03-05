// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './CodeBlock.scss';

type Props = {|
  +code: string,
|};

@observer
export default class CodeBlock extends Component<Props> {
  render(): Node {
    return (
      <div className={styles.component}>
        <code>{this.props.code}</code>
      </div>
    );
  }
}
