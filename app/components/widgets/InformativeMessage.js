// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
import styles from './InformativeMessage.scss';

type Props = {|
  title?: string,
  message?: string,
  subclass?: string,
  children?: Node
|};

@observer
export default class InformativeMessage extends Component<Props> {
  static defaultProps = {
    title: '',
    message: '',
    subclass: '',
    children: null
  };

  render() {
    const { title, message, subclass, children } = this.props;

    const messageStyle = classNames([
      subclass ? styles[subclass] : styles.component
    ]);

    if (children !== null) {
      return (
        <div className={messageStyle}>
          {children}
        </div>
      );
    }
    return (
      <div className={messageStyle}>
        {title && <h1>{title}</h1>}
        {message && <ReactMarkdown source={message} escapeHtml={false} />}
      </div>
    );
  }
}
