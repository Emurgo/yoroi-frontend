// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
import styles from './InformativeMessage.scss';

type Props = {
  title?: string,
  message?: string,
  subclass?: string,
};

@observer
export default class InformativeMessage extends Component<Props> {
  static defaultProps = {
    title: '',
    message: '',
    subclass: ''
  };

  render() {
    const { title, message, subclass } = this.props;

    const messageStyle = classNames([
      subclass ? styles[subclass] : styles.component
    ]);

    return (
      <div className={messageStyle}>
        {title && <h1>{title}</h1>}
        {message && <ReactMarkdown source={message} />}
      </div>
    );
  }
}
