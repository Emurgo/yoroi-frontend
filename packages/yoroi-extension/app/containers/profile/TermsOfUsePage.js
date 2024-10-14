// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TermsOfUseForm from '../../components/profile/terms-of-use/TermsOfUseForm';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import environment from '../../environment';

@observer
export default class TermsOfUsePage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { checkAdaServerStatus } = this.props.stores.serverConnectionStore;
    const { selected } = this.props.stores.wallets;
    const isWalletTestnet = Boolean(selected && selected.isTestnet);

    const displayedBanner = checkAdaServerStatus === ServerStatusErrors.Healthy
      ? <TestnetWarningBanner isTestnet={isWalletTestnet} />
      : <ServerErrorBanner errorType={checkAdaServerStatus} />;
    return (
      <TopBarLayout
        topbar={undefined}
        banner={displayedBanner}
      >
        <IntroBanner
          isNightly={environment.isNightly()}
        />

        <TermsOfUseForm
          localizedTermsOfUse={this.props.stores.profile.termsOfUse}
          localizedPrivacyNotice={this.props.stores.profile.privacyNotice}
          onSubmit={this.props.actions.profile.acceptTermsOfUse.trigger}
          isSubmitting={false}
          error={undefined}
        />
      </TopBarLayout>
    );
  }
}
