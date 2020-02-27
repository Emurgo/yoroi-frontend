// @flow
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import environment from '../../environment';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TermsOfUseForm from '../../components/profile/terms-of-use/TermsOfUseForm';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';
import LocalizableError from '../../i18n/LocalizableError';
import ProfleActions from '../../actions/profile-actions';

const messages = defineMessages({
  title: {
    id: 'profile.termsOfUse.title',
    defaultMessage: '!!!Terms Of Use',
  },
});

type GeneratedData = {|
  +stores: {|
    +profile: {|
      +setTermsOfUseAcceptanceRequest: {|
        +isExecuting: boolean,
        +error: ?LocalizableError,
      |},
      +termsOfUse: string,
    |},
    +serverConnectionStore: {|
      +checkAdaServerStatus: ServerStatusErrorType,
    |},
  |},
  +actions: {|
    +profile: {|
      +acceptTermsOfUse: {|
        +trigger: typeof ProfleActions.prototype.acceptTermsOfUse.trigger
      |},
    |},
  |},
|};

@observer
export default class TermsOfUsePage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(TermsOfUsePage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;
    return Object.freeze({
      stores: {
        profile: {
          setTermsOfUseAcceptanceRequest: {
            error: profileStore.setTermsOfUseAcceptanceRequest.error,
            isExecuting: profileStore.setTermsOfUseAcceptanceRequest.isExecuting,
          },
          termsOfUse: profileStore.termsOfUse,
        },
        serverConnectionStore: {
          checkAdaServerStatus: stores.substores[environment.API]
            .serverConnectionStore.checkAdaServerStatus,
        },
      },
      actions: {
        profile: {
          acceptTermsOfUse: { trigger: actions.profile.acceptTermsOfUse.trigger },
        },
      },
    });
  }

  render() {
    const { checkAdaServerStatus } = this.generated.stores.serverConnectionStore;
    const displayedBanner = checkAdaServerStatus === ServerStatusErrors.Healthy ?
      <TestnetWarningBanner /> :
      <ServerErrorBanner errorType={checkAdaServerStatus} />;
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
        <TermsOfUseForm
          localizedTermsOfUse={this.generated.stores.profile.termsOfUse}
          onSubmit={this.generated.actions.profile.acceptTermsOfUse.trigger}
          isSubmitting={this.generated.stores.profile.setTermsOfUseAcceptanceRequest.isExecuting}
          error={this.generated.stores.profile.setTermsOfUseAcceptanceRequest.error}
        />
      </TopBarLayout>
    );
  }
}
