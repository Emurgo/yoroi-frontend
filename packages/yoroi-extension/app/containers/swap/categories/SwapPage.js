// @flow
import type { Node } from 'react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { LanguageType } from '../../../i18n/translations';
import type { Theme } from '../../../styles/utils';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import { handleExternalLinkClick } from '../../../utils/routing';
import { THEMES } from '../../../styles/utils';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { ReactComponent as AdaCurrency } from '../../../assets/images/currencies/ADA.inline.svg';
import { unitOfAccountDisabledValue } from '../../../types/unitOfAccountType';
import { trackSetUnitOfAccount, trackSetLocale } from '../../../api/analytics';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import UnitOfAccountSettings from '../../../components/settings/categories/general-setting/UnitOfAccountSettings';
import LocalizableError from '../../../i18n/LocalizableError';

type GeneratedData = typeof SwapPage.prototype.generated;

@observer
export default class SwapPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    return <>Swap form here</>;
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        updateLocale: {|
          trigger: (params: {|
            locale: string,
          |}) => Promise<void>,
        |},
        updateTheme: {|
          trigger: (params: {|
            theme: string,
          |}) => Promise<void>,
        |},
        updateUnitOfAccount: {|
          trigger: (params: UnitOfAccountSettingType) => Promise<void>,
        |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
      wallets: {|
        setActiveWallet: {|
          trigger: (params: {|
            wallet: PublicDeriver<>,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      app: {| currentRoute: string |},
      profile: {|
        LANGUAGE_OPTIONS: Array<LanguageType>,
        currentLocale: string,
        currentTheme: Theme,
        setProfileLocaleRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
        |},
        UNIT_OF_ACCOUNT_OPTIONS: Array<{|
          svg: string,
          symbol: string,
        |}>,
        setUnitOfAccountRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
        |},
        unitOfAccount: UnitOfAccountSettingType,
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
        publicDerivers: Array<PublicDeriver<>>,
        getLastSelectedWallet: void => ?PublicDeriver<>,
      |},
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?string,
        lastUpdateTimestamp: null | number,
        refreshCurrentUnit: {| isExecuting: boolean |},
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SwapPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;
    return Object.freeze({
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
        },
        profile: {
          setProfileLocaleRequest: {
            isExecuting: profileStore.setProfileLocaleRequest.isExecuting,
            error: profileStore.setProfileLocaleRequest.error,
          },
          LANGUAGE_OPTIONS: profileStore.LANGUAGE_OPTIONS,
          currentLocale: profileStore.currentLocale,
          currentTheme: profileStore.currentTheme,
          UNIT_OF_ACCOUNT_OPTIONS: profileStore.UNIT_OF_ACCOUNT_OPTIONS,
          unitOfAccount: profileStore.unitOfAccount,
          setUnitOfAccountRequest: {
            error: profileStore.setUnitOfAccountRequest.error,
            isExecuting: profileStore.setUnitOfAccountRequest.isExecuting,
          },
        },
        wallets: {
          selected: stores.wallets.selected,
          publicDerivers: stores.wallets.publicDerivers,
          getLastSelectedWallet: stores.wallets.getLastSelectedWallet,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
          lastUpdateTimestamp: stores.coinPriceStore.lastUpdateTimestamp,
          refreshCurrentUnit: {
            isExecuting: stores.coinPriceStore.refreshCurrentUnit.isExecuting,
          },
        },
      },
      actions: {
        wallets: {
          setActiveWallet: { trigger: actions.wallets.setActiveWallet.trigger },
        },
        profile: {
          updateLocale: { trigger: actions.profile.updateLocale.trigger },
          updateTheme: { trigger: actions.profile.updateTheme.trigger },
          updateUnitOfAccount: { trigger: actions.profile.updateUnitOfAccount.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
    });
  }
}
