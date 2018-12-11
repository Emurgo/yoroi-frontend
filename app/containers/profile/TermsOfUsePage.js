// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TermsOfUseForm from '../../components/profile/terms-of-use/TermsOfUseForm';
import type { InjectedProps } from '../../types/injectedPropsType';

const messages = defineMessages({
  title: {
    id: 'profile.termsOfUse.title',
    defaultMessage: '!!!Terms Of Use',
    description: 'Terms of Use Title.'
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

  render() {
    const {
      setTermsOfUseAcceptanceRequest,
      termsOfUse,
      lockScreenEnabled,
      pinCode,
    } = this.props.stores.profile;
    const isSubmitting = setTermsOfUseAcceptanceRequest.isExecuting;
    const { topbar } = this.props.stores;
    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topbarElement = (
      <TopBar
        title={topbarTitle}
        activeTopbarCategory={topbar.activeTopbarCategory}
        lockIconIsVisible={lockScreenEnabled && Boolean(pinCode)}
        lockApp={this.props.actions.profile.toggleAppLocked.trigger}
      />);
    return (
      <TopBarLayout
        topbar={topbarElement}
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
