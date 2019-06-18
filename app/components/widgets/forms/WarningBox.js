// @flow
import React, { Component } from 'react';
import type { Node } from 'react';

import SvgInline from 'react-svg-inline';
import dangerIcon from '../../../assets/images/danger.inline.svg';

import styles from './WarningBox.scss';

type Props = {|
  children: ?Node
|};

export default class WarningBox extends Component<Props> {

  render() {
    const { children } = this.props;
    return (
      <div className={styles.contentWarning}>
        <SvgInline svg={dangerIcon} className={styles.icon} />
        <p className={styles.warning}>{children}</p>
      </div>
    );
  }
}
