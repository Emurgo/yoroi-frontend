// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction } from 'mobx';
import { intlShape } from 'react-intl';
import environment from '../../environment';

import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import UriPromptForm from '../../components/profile/uri-prompt/UriPromptForm';
import UriAccept from '../../components/profile/uri-prompt/UriAccept';
import UriSkip from '../../components/profile/uri-prompt/UriSkip';

import type { InjectedOrGenerated } from '../../types/injectedPropsType';
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

type GeneratedData = typeof UriPromptPage.prototype.generated;

@observer
export default class UriPromptPage extends Component<InjectedOrGenerated<GeneratedData>> {

  @observable
  selectedChoice: CHOICES | null = null;

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onAccept: void => void = () => {
    registerProtocols();
    runInAction(() => {
      this.selectedChoice = Choices.ACCEPT;
    });
  };

  onSkip: void => void = () => {
    runInAction(() => {
      this.selectedChoice = Choices.SKIP;
    });
  };

  onBack: void => void = () => {
    runInAction(() => {
      this.selectedChoice = null;
    });
  };

  _getContent = () => {
    switch (this.selectedChoice) {
      case null:
        return <UriPromptForm
          onAccept={this.onAccept}
          onSkip={this.onSkip}
          classicTheme={this.generated.stores.profile.isClassicTheme}
        />;
      case Choices.ACCEPT:
        return <UriAccept
          onConfirm={this.generated.actions.profile.acceptUriScheme.trigger}
          onBack={this.onBack}
          classicTheme={this.generated.stores.profile.isClassicTheme}
        />;
      case Choices.SKIP:
        return <UriSkip
          onConfirm={this.generated.actions.profile.acceptUriScheme.trigger}
          onBack={this.onBack}
          classicTheme={this.generated.stores.profile.isClassicTheme}
        />;
      default:
        throw new Error('UriPromptPage::_getContent Should never happen');
    }
  }

  render() {
    const { checkAdaServerStatus } = this.generated.stores.serverConnectionStore;
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

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(UriPromptPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: profileStore.isClassicTheme,
        },
        serverConnectionStore: {
          checkAdaServerStatus: stores.substores[environment.API]
            .serverConnectionStore.checkAdaServerStatus,
        },
      },
      actions: {
        profile: {
          acceptUriScheme: { trigger: actions.profile.acceptUriScheme.trigger },
        },
      },
    });
  }
}
