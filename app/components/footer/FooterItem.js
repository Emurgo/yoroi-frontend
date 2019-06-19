// @flow
import React, { Component } from 'react';
import type { MessageDescriptor } from 'react-intl';
import LinkButton from '../widgets/LinkButton';
import styles from './FooterItem.scss';

type Props = {|
  url: string,
  svg: string,
  message: MessageDescriptor
|};

export default class FooterItem extends Component<Props> {

  render() {
    const { url, svg, message } = this.props;

    return (
      <LinkButton
        url={url}
        svg={svg}
        message={message}
        textClassName={styles.text}
      />
    );
  }
}
