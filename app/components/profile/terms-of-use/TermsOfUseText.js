// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import styles from './TermsOfUseText.scss';

type Props = {
  localizedTermsOfUse: string,
  isClassicThemeActive?: boolean
};

@observer
export default class TermsOfUseText extends Component<Props> {
  static defaultProps = {
    isClassicThemeActive: false
  }

  render() {
    const { isClassicThemeActive } = this.props;
    return (
      <div className={isClassicThemeActive ? styles.termsClassic : styles.terms}>
        <ReactMarkdown source={this.props.localizedTermsOfUse} />
      </div>
    );
  }

}
