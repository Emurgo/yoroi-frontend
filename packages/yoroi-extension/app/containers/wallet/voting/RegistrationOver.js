// @flow
import type { Node } from 'react';
import { Component } from 'react';
import FullscreenMessage from '../../../components/wallet/layouts/FullscreenMessage';
import { ReactComponent as RegistrationNotAvailable } from '../../../assets/images/revamp/registration-is-not-available.inline.svg';
import { observer } from 'mobx-react';

type Props = {|
  title: string | Node,
  subtitle: string | Node,
|};

@observer
export default class RegistrationOver extends Component<Props> {
  render(): Node {
    return (
      <FullscreenMessage
        image={<RegistrationNotAvailable />}
        title={this.props.title}
        subtitle={this.props.subtitle}
      />
    );
  }
}
