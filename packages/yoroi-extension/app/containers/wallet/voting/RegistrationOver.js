// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import FullscreenMessage from '../../../components/wallet/layouts/FullscreenMessage';
import { observer } from 'mobx-react';


type Props = {|
  title: string,
  subtitle: string,
|};

@observer
export default class RegistrationOver extends Component<Props> {

  render(): Node {
    return (
      <FullscreenMessage
        title={this.props.title}
        subtitle={this.props.subtitle}
      />
    );
  }
}
