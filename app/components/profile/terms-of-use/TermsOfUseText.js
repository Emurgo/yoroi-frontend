// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import styles from './TermsOfUseText.scss';
import classNames from 'classnames';

type Props = {|
  +localizedTermsOfUse: string,
  +fixedHeight?: boolean,
|};

@observer
export default class TermsOfUseText extends Component<Props> {
  static defaultProps: {|fixedHeight: boolean|} = {
    fixedHeight: false
  }

  render(): Node {
    const termsClassNames = classNames([
      styles.terms,
      this.props.fixedHeight === true ? styles.fixedHeight : null,
    ]);

    return (
      <div className={termsClassNames}>
        <ReactMarkdown source={this.props.localizedTermsOfUse} escapeHtml={false} />
      </div>
    );
  }

}
