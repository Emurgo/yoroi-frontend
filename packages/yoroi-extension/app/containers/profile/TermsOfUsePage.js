// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import TermsOfUseForm from '../../components/profile/terms-of-use/TermsOfUseForm';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { isErgo, isTestnet } from '../../api/ada/lib/storage/database/prepackaged/networks';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import environment from '../../environment';

type GeneratedData = typeof TermsOfUsePage.prototype.generated;

@observer
export default class TermsOfUsePage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { checkAdaServerStatus } = this.generated.stores.serverConnectionStore;
    const { selected } = this.generated.stores.wallets;
    const isWalletTestnet =
      selected == null ? false : isTestnet(selected.getParent().getNetworkInfo());
    const isWalletErgo = selected == null ? false : isErgo(selected.getParent().getNetworkInfo());

    const displayedBanner = checkAdaServerStatus === ServerStatusErrors.Healthy
      ? <TestnetWarningBanner isTestnet={isWalletTestnet} isErgo={isWalletErgo} />
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
          localizedTermsOfUse={this.generated.stores.profile.termsOfUse}
          localizedPrivacyNotice={this.generated.stores.profile.privacyNotice}
          onSubmit={this.generated.actions.profile.acceptTermsOfUse.trigger}
          isSubmitting={this.generated.stores.profile.setTermsOfUseAcceptanceRequest.isExecuting}
          error={this.generated.stores.profile.setTermsOfUseAcceptanceRequest.error}
        />
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        acceptTermsOfUse: {|
          trigger: (params: void) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      wallets: {| selected: null | PublicDeriver<> |},
      profile: {|
        setTermsOfUseAcceptanceRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
        |},
        termsOfUse: string,
        privacyNotice: string,
      |},
      serverConnectionStore: {|
        checkAdaServerStatus: ServerStatusErrorType,
      |},
    |},
  |} {
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
            error: undefined,
            isExecuting: false,
          },
          termsOfUse: profileStore.termsOfUse,
          privacyNotice: profileStore.privacyNotice,
        },
        serverConnectionStore: {
          checkAdaServerStatus: stores.serverConnectionStore.checkAdaServerStatus,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
      },
      actions: {
        profile: {
          acceptTermsOfUse: { trigger: actions.profile.acceptTermsOfUse.trigger },
        },
      },
    });
  }
}
