// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import FullscreenMessage from '../../../components/wallet/layouts/FullscreenMessage';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import string from 'lodash/string';


type Props = {|
  title: string,
  subtitle: string,
|};

@observer
export default class RegistrationOver extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <FullscreenMessage
        title={this.props.title}
        subtitle={this.props.subtitle}
      />
    );
  }
}
