// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import environment from '../../environment';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TermsOfUseForm from '../../components/profile/terms-of-use/TermsOfUseForm';
import type { InjectedProps } from '../../types/injectedPropsType';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';

const messages = defineMessages({
  title: {
    id: 'profile.termsOfUse.title',
    defaultMessage: '!!!Terms Of Use',
  },
});

@observer
export default class TermsOfUsePage extends Component<InjectedProps> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onSubmit = () => {
    this.props.actions.profile.acceptTermsOfUse.trigger();
  };

  displayedBanner = (connectionErrorType: ?ServerStatusErrorType) => {
    connectionErrorType === null ?
      <TestnetWarningBanner /> :
      <ServerErrorBanner errorType={connectionErrorType} />;
  };

  render() {
    const { setTermsOfUseAcceptanceRequest, termsOfUse } = this.props.stores.profile;
    const isSubmitting = setTermsOfUseAcceptanceRequest.isExecuting;
    const { stores } = this.props;
    const { topbar, profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topbarElement = (
      <TopBar
        title={topbarTitle}
        activeTopbarCategory={topbar.activeTopbarCategory}
      />);
    return (
      <TopBarLayout
        topbar={topbarElement}
        classicTheme={profile.isClassicTheme}
        banner={this.displayedBanner(checkAdaServerStatus)}
      >
        <TermsOfUseForm
          localizedTermsOfUse={termsOfUse}
          onSubmit={this.onSubmit}
          isSubmitting={isSubmitting}
          error={setTermsOfUseAcceptanceRequest.error}
        />
      </TopBarLayout>
    );
  }
}
