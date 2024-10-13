// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import environment from '../../environment';
import TopBarLayout from '../../components/layout/TopBarLayout';
import LanguageSelectionForm from '../../components/profile/language-selection/LanguageSelectionForm';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';

@observer
export default class LanguageSelectionPage extends Component<StoresAndActionsProps> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    const profileStore = this.props.stores.profile;
    // if user uses back button to get back to this page
    // we need to undo saving the language to storage so they can pick a new language
    if (profileStore.isCurrentLocaleSet) {
      const prevLang = profileStore.currentLocale;
      // tentatively set language to their previous selection
      this.props.actions.profile.updateTentativeLocale.trigger({ locale: prevLang });
    }

    await this.props.actions.profile.resetLocale.trigger();
  }

  onSelectLanguage: {| locale: string |} => void = (values) => {
    this.props.actions.profile.updateTentativeLocale.trigger(values);
  };

  onSubmit: {| locale: string |} => Promise<void> = async (_values) => {
    // Important! The order of triggering these two events must not be exchanged!
    await this.props.actions.profile.acceptTermsOfUse.trigger();
    await this.props.actions.profile.commitLocaleToStorage.trigger();
  };

  renderByron(props: StoresAndActionsProps): Node {
    const { selected } = this.props.stores.wallets;
    const isWalletTestnet = Boolean(selected && selected.isTestnet);
    const displayedBanner = props.stores
      .serverConnectionStore.checkAdaServerStatus === ServerStatusErrors.Healthy
      ? <TestnetWarningBanner isTestnet={isWalletTestnet} />
      : <ServerErrorBanner errorType={
        props.stores.serverConnectionStore.checkAdaServerStatus
      }
      />;
    return (
      <TopBarLayout
        languageSelectionBackground
        banner={displayedBanner}
      >
        <IntroBanner
          isNightly={environment.isNightly()}
        />
        <LanguageSelectionForm
          onSelectLanguage={this.onSelectLanguage}
          onSubmit={this.onSubmit}
          isSubmitting={props.stores.profile.setProfileLocaleRequest.isExecuting}
          currentLocale={props.stores.profile.currentLocale}
          languages={props.stores.profile.LANGUAGE_OPTIONS}
          error={props.stores.profile.setProfileLocaleRequest.error}
          localizedTermsOfUse={this.props.stores.profile.termsOfUse}
          localizedPrivacyNotice={this.props.stores.profile.privacyNotice}
        />
      </TopBarLayout>
    );
  }

  render(): Node {
    return this.renderByron(this.props);
  }
}
