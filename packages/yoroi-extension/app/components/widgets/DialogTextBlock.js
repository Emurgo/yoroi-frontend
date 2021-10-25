// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
import styles from './DialogTextBlock.scss';

type Props = {|
  +title?: string,
  +message?: string,
  +subclass?: string,
  +children?: Node
|};

@observer
export default class DialogTextBlock extends Component<Props> {
  static defaultProps: {|children: null, message: string, subclass: string, title: string|} = {
    title: '',
    message: '',
    subclass: '',
    children: null
  };

  render(): Node {
    const { title, message, subclass, children } = this.props;

    const messageStyle = classNames([
      (subclass != null && subclass !== '') ? styles[subclass] : styles.component
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
        {(title != null && title !== '') ? (<h1>{title}</h1>) : null}
        {(message != null && message !== '') ? (<ReactMarkdown source={message} escapeHtml={false} />) : null}
      </div>
    );
  }
}
