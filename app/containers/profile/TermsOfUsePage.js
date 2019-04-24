// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TermsOfUseForm from '../../components/profile/terms-of-use/TermsOfUseForm';
import type { InjectedProps } from '../../types/injectedPropsType';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';

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

  render() {
    const { setTermsOfUseAcceptanceRequest, termsOfUse } = this.props.stores.profile;
    const isSubmitting = setTermsOfUseAcceptanceRequest.isExecuting;
    const { topbar } = this.props.stores;
    const { isClassicThemeActive } = this.props.stores.profile;
    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topbarElement = (
      <TopBar
        title={topbarTitle}
        activeTopbarCategory={topbar.activeTopbarCategory}
        isClassicThemeActive={isClassicThemeActive}
      />);
    return (
      <TopBarLayout
        topbar={topbarElement}
        banner={<TestnetWarningBanner isClassicThemeActive={isClassicThemeActive} />}
      >
        <TermsOfUseForm
          isClassicThemeActive={isClassicThemeActive}
          localizedTermsOfUse={termsOfUse}
          onSubmit={this.onSubmit}
          isSubmitting={isSubmitting}
          error={setTermsOfUseAcceptanceRequest.error}
        />
      </TopBarLayout>
    );
  }
}
