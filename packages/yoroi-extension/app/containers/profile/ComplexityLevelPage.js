// @flow
import { Component } from 'react';
import type { Node } from 'react';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TopBar from '../../components/topbar/TopBar';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import { defineMessages, intlShape } from 'react-intl';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ComplexityLevel from '../../components/profile/complexity-level/ComplexityLevelForm';
import { isTestnet } from '../../api/ada/lib/storage/database/prepackaged/networks';

const messages = defineMessages({
  title: {
    id: 'profile.complexityLevel.title',
    defaultMessage: '!!!Level of Interface Complexity',
  },
});

@observer
export default class ComplexityLevelPage extends Component<StoresAndActionsProps> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {

    const { checkAdaServerStatus } = this.props.stores.serverConnectionStore;

    const { selected } = this.props.stores.wallets;
    const isWalletTestnet = selected == null
      ? false
      : isTestnet(selected.getParent().getNetworkInfo());
    const displayedBanner = checkAdaServerStatus === ServerStatusErrors.Healthy
      ? <TestnetWarningBanner isTestnet={isWalletTestnet} />
      : <ServerErrorBanner errorType={checkAdaServerStatus} />;

    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );

    const topbarElement = (
      <TopBar
        title={topbarTitle}
      />);
    return (
      <TopBarLayout
        topbar={topbarElement}
        banner={displayedBanner}
      >
        <ComplexityLevel
          complexityLevel={this.props.stores.profile.selectedComplexityLevel}
          onSubmit={this.props.actions.profile.selectComplexityLevel.trigger}
          isSubmitting={this.props.stores.profile.setComplexityLevelRequest.isExecuting}
          error={this.props.stores.profile.setComplexityLevelRequest.error}
        />
      </TopBarLayout>
    );
  }
}
