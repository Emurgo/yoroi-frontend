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

import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import registerProtocols from '../../uri-protocols';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { noop } from '../../coreUtils';
import type { StoresProps } from '../../stores';

@observer
export default class UriPromptPage extends Component<StoresProps> {

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
    noop(this.props.stores.profile.acceptUriScheme());
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
        />;
    }

    if (this.isAccepted) {
        return <UriAccept
          onConfirm={this.props.stores.profile.acceptUriScheme}
          onBack={this.onBack}
        />;
    }

    throw new Error('UriPromptPage::_getContent Should never happen');
  }

  render(): Node {
    const { checkAdaServerStatus } = this.props.stores.serverConnectionStore;
    const { selected } = this.props.stores.wallets;
    const isWalletTestnet = Boolean(selected && selected.isTestnet);

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
