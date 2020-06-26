// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import styles from './FullscreenMessage.scss';
import VerticallyCenteredLayout from '../../layout/VerticallyCenteredLayout';
import FullscreenLayout from '../../layout/FullscreenLayout';
import { observer } from 'mobx-react';

type Props = {|
  +title: string,
  +subtitle: string,
|};

@observer
export default class FullscreenMessage extends Component<Props> {
  render(): Node {
    return (
      <FullscreenLayout bottomPadding={57}>
        <VerticallyCenteredLayout>
          <div className={styles.component}>
            <div className={styles.title}>
              {this.props.title}
            </div>
            <br />
            <div className={styles.subtitle}>
              {this.props.subtitle}
            </div>
          </div>
        </VerticallyCenteredLayout>
      </FullscreenLayout>
    );
  }
}
