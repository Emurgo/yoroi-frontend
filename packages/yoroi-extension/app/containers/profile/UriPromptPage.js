// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import { intlShape } from 'react-intl';

import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import UriPromptForm from '../../components/profile/uri-prompt/UriPromptForm';
import UriAccept from '../../components/profile/uri-prompt/UriAccept';

import type { StoresAndActionsProps } from '../../types/injectedPropsType';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import registerProtocols from '../../uri-protocols';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { isTestnet } from '../../api/ada/lib/storage/database/prepackaged/networks';

@observer
export default class UriPromptPage extends Component<StoresAndActionsProps> {

  @observable
  isAccepted: boolean = false;

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  onAccept: void => void = () => {
    registerProtocols();
    runInAction(() => {
      this.isAccepted = true;
    });
  };

  onSkip: void => void = () => {
    this.props.actions.profile.acceptUriScheme.trigger()
  };

  onBack: void => void = () => {
    runInAction(() => {
      this.isAccepted = false;
    });
  };

  _getContent: (() => Node) = () => {
    if (!this.isAccepted) {
        return <UriPromptForm
          onAccept={this.onAccept}
          onSkip={this.onSkip}
          classicTheme={this.props.stores.profile.isClassicTheme}
        />;
    }

    if (this.isAccepted) {
        return <UriAccept
          onConfirm={this.props.actions.profile.acceptUriScheme.trigger}
          onBack={this.onBack}
          classicTheme={this.props.stores.profile.isClassicTheme}
        />;
    }

    throw new Error('UriPromptPage::_getContent Should never happen');
  }

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
      <StaticTopbarTitle title={this.context.intl.formatMessage(globalMessages.uriSchemeLabel)} />
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
        {this._getContent()}
      </TopBarLayout>
    );
  }
}
