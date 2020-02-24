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
import { ServerStatusErrors } from '../../types/serverStatusErrorType';

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

  render() {
    const { setTermsOfUseAcceptanceRequest, termsOfUse } = this.props.stores.profile;
    const isSubmitting = setTermsOfUseAcceptanceRequest.isExecuting;
    const { stores } = this.props;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
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
          localizedTermsOfUse={termsOfUse}
          onSubmit={this.props.actions.profile.acceptTermsOfUse.trigger}
          isSubmitting={isSubmitting}
          error={setTermsOfUseAcceptanceRequest.error}
        />
      </TopBarLayout>
    );
  }
}
