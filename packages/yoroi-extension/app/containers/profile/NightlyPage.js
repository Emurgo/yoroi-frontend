// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import NightlyForm from '../../components/profile/nightly/NightlyForm';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'profile.nightly.title',
    defaultMessage: '!!!Yoroi Nightly',
  },
});

@observer
export default class NightlyPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  acceptNightly: void => void = () => {
    this.props.stores.profile.acceptNightly();
  };

  render(): Node {
    const topBartitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = <TopBar title={topBartitle} />;
    return (
      <TopBarLayout topbar={topBar} banner={undefined}>
        <NightlyForm onSubmit={this.acceptNightly} />
      </TopBarLayout>
    );
  }
}
