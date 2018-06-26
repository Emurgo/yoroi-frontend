// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import TextOnlyTopBar from '../../components/layout/TextOnlyTopbar';
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

@inject('stores', 'actions') @observer
export default class TermsOfUsePage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onSubmit = () => {
    this.props.actions.profile.acceptTermsOfUse.trigger();
  };

  render() {
    const { setTermsOfUseAcceptanceRequest, termsOfUse } = this.props.stores.profile;
    const isSubmitting = setTermsOfUseAcceptanceRequest.isExecuting;
    const topbar = <TextOnlyTopBar title={this.context.intl.formatMessage(messages.title)} />
    return (
      <TopBarLayout
        topbar={topbar}
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
