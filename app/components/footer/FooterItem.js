import React, { Component } from 'react';
import './FooterItem.scss';

import LinkButton from '../widgets/LinkButton';

type Props = {
  url: string,
  svg: string,
  message: any
};

export default class FooterItem extends Component<Props> {

  render() {
    const { url, svg, message } = this.props;

    return (
      <LinkButton
        url={url}
        svg={svg}
        message={message}
      />
    );
  }
}
