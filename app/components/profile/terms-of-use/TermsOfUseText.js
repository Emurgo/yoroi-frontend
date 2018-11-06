// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import styles from './TermsOfUseText.scss';

type Props = {
  localizedTermsOfUse: string,
};

export default
@observer
class TermsOfUseText extends Component<Props> {
  render() {
    return (
      <div className={styles.terms}>
        <ReactMarkdown source={this.props.localizedTermsOfUse} />
      </div>
    );
  }

}
