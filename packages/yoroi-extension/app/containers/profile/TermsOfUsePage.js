// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TermsOfUseForm from '../../components/profile/terms-of-use/TermsOfUseForm';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import environment from '../../environment';
import type { StoresProps } from '../../stores';

@observer
export default class TermsOfUsePage extends Component<StoresProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { stores } = this.props;
    const { checkAdaServerStatus } = stores.serverConnectionStore;
    const { selected } = stores.wallets;
    const isWalletTestnet = Boolean(selected?.isTestnet);

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
          localizedTermsOfUse={stores.profile.termsOfUse}
          localizedPrivacyNotice={stores.profile.privacyNotice}
          onSubmit={stores.profile.acceptTermsOfUse}
          isSubmitting={false}
          error={undefined}
        />
      </TopBarLayout>
    );
  }
}
