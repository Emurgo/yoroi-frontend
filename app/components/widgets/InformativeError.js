// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';

import EmptyIllustration from '../../assets/images/dashboard/empty-dashboard.inline.svg';
import styles from './InformativeError.scss';

type Props = {|
  title: string,
  text: ?string,
|};

@observer
export default class InformativeError extends Component<Props> {
  render(): Node {
    return (
      <div className={styles.wrapper}>
        <EmptyIllustration />
        <div className={styles.text}>
          <h3 className={styles.title}>{this.props.title}</h3>
          {this.props.text != null && (
            <p className={styles.paragraph}>{this.props.text}</p>
          )}
        </div>
      </div>
    );
  }
}
