// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import styles from './TermsOfUseText.scss';

type Props = {
  localizedTermsOfUse: string,
  oldTheme?: boolean
};

@observer
export default class TermsOfUseText extends Component<Props> {
  static defaultProps = {
    oldTheme: false
  }

  render() {
    const { oldTheme } = this.props;
    return (
      <div className={oldTheme ? styles.termsOld : styles.terms}>
        <ReactMarkdown source={this.props.localizedTermsOfUse} />
      </div>
    );
  }

}
