// @flow
import React, { Component } from 'react';
import Helmet from 'react-helmet';

type Props = {|
  +title?: string,
|};

export default class MetaTags extends Component<Props> {
  static defaultProps = {
    title: 'Yoroi',
  };

  render() {
    const {
      title
    } = this.props;

    return (
      <Helmet>
        {title != null && <title>{title}</title>}
      </Helmet>
    );
  }
}
