// @flow
import type { Node, ComponentType } from 'react';
import { Component } from 'react';
import FullscreenMessage from '../../../components/wallet/layouts/FullscreenMessage';
import { ReactComponent as RegistrationNotAvailable } from '../../../assets/images/revamp/registration-is-not-available.inline.svg';
import { observer } from 'mobx-react';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';

type Props = {|
  title: string | Node,
  subtitle: string | Node,
|};

@observer
class RegistrationOver extends Component<Props & InjectedLayoutProps> {
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

export default (withLayout(RegistrationOver): ComponentType<Props>);
