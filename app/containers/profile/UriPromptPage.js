// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import { intlShape } from 'react-intl';
import environment from '../../environment';

import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import UriPromptForm from '../../components/profile/uri-prompt/UriPromptForm';
import UriAccept from '../../components/profile/uri-prompt/UriAccept';
import UriSkip from '../../components/profile/uri-prompt/UriSkip';

import type { InjectedProps } from '../../types/injectedPropsType';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import registerProtocols from '../../uri-protocols';
import globalMessages from '../../i18n/global-messages';

const Choices = {
  ACCEPT: 'accept',
  SKIP: 'skip',
};
type CHOICES = $Values<typeof Choices>;

@observer
export default class UriPromptPage extends Component<InjectedProps> {

  @observable
  selectedChoice: CHOICES | null = null;

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onAccept = () => {
    registerProtocols();
    runInAction(() => {
      this.selectedChoice = Choices.ACCEPT;
    });
  };

  onSkip = () => {
    runInAction(() => {
      this.selectedChoice = Choices.SKIP;
    });
  };

  onBack = () => {
    runInAction(() => {
      this.selectedChoice = null;
    });
  };

  _getContent = () => {
    const { profile } = this.props.stores;
    switch (this.selectedChoice) {
      case null:
        return <UriPromptForm
          onAccept={this.onAccept}
          onSkip={this.onSkip}
          classicTheme={profile.isClassicTheme}
        />;
      case Choices.ACCEPT:
        return <UriAccept
          onConfirm={this.props.actions.profile.acceptUriScheme.trigger}
          onBack={this.onBack}
          classicTheme={profile.isClassicTheme}
        />;
      case Choices.SKIP:
        return <UriSkip
          onConfirm={this.props.actions.profile.acceptUriScheme.trigger}
          onBack={this.onBack}
          classicTheme={profile.isClassicTheme}
        />;
      default:
        throw new Error('UriPromptPage::_getContent Should never happen');
    }
  }

  render() {
    const { stores } = this.props;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const displayedBanner = checkAdaServerStatus === ServerStatusErrors.Healthy ?
      <TestnetWarningBanner /> :
      <ServerErrorBanner errorType={checkAdaServerStatus} />;
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
