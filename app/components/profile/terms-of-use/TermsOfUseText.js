// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import styles from './TermsOfUseText.scss';

type Props = {
  localizedTermsOfUse: string,
  classicTheme: boolean
};

@observer
export default class TermsOfUseText extends Component<Props> {
  render() {
    const { classicTheme } = this.props;
    return (
      <div className={classicTheme ? styles.termsClassic : styles.terms}>
        <ReactMarkdown source={this.props.localizedTermsOfUse} />
      </div>
    );
  }

}
