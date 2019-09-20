// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import styles from './TermsOfUseText.scss';
import classNames from 'classnames';

type Props = {|
  localizedTermsOfUse: string,
  fixedHeight?: bool,
|};

@observer
export default class TermsOfUseText extends Component<Props> {
  static defaultProps = {
    fixedHeight: false
  }

  render() {
    const termsClassNames = classNames([
      styles.terms,
      this.props.fixedHeight != null ? styles.fixedHeight : null,
    ]);

    return (
      <div className={termsClassNames}>
        <ReactMarkdown source={this.props.localizedTermsOfUse} escapeHtml={false} />
      </div>
    );
  }

}
