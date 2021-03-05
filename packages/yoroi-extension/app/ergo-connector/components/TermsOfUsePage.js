// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import TermsOfUseText from '../../components/profile/terms-of-use/TermsOfUseText';
import styles from './TermsOfUsePage.scss';

type Props = {|
  +localizedTermsOfUse: string,
|};

@observer
export default class TermsOfUsePage extends Component<Props> {
  render(): Node {
    return (
      <div className={styles.component}>
        <TermsOfUseText localizedTermsOfUse={this.props.localizedTermsOfUse} />
      </div>
    );
  }
}
