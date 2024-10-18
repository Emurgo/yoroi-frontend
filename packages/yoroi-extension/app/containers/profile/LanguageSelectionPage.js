// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import environment from '../../environment';
import TopBarLayout from '../../components/layout/TopBarLayout';
import LanguageSelectionForm from '../../components/profile/language-selection/LanguageSelectionForm';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import type { StoresProps } from '../../stores';

@observer
export default class LanguageSelectionPage extends Component<StoresProps> {

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
      this.props.stores.profile.updateTentativeLocale({ locale: prevLang });
    }

    await this.props.stores.profile.resetLocale();
  }

  onSelectLanguage: {| locale: string |} => void = (values) => {
    this.props.stores.profile.updateTentativeLocale(values);
  };

  onSubmit: {| locale: string |} => Promise<void> = async (_values) => {
    // Important! The order of triggering these two events must not be exchanged!
    const { stores } = this.props;
    await stores.profile.acceptTermsOfUse();
    await stores.profile.acceptLocale();
  };

  renderByron(props: StoresProps): Node {
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
