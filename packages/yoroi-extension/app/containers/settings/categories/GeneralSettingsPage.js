// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import { handleExternalLinkClick } from '../../../utils/routing';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import UnitOfAccountSettings from '../../../components/settings/categories/general-setting/UnitOfAccountSettings';
import LocalizableError from '../../../i18n/LocalizableError';
import type { LanguageType } from '../../../i18n/translations';
import { THEMES } from '../../../styles/utils';
import type { Theme } from '../../../styles/utils';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { ReactComponent as AdaCurrency } from '../../../assets/images/currencies/ADA.inline.svg';
import { unitOfAccountDisabledValue } from '../../../types/unitOfAccountType';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { trackSetUnitOfAccount, trackSetLocale } from '../../../api/analytics';
import { Box, Typography } from '@mui/material';
import { settingsMenuMessages } from '../../../components/settings/menu/SettingsMenu';

const currencyLabels = defineMessages({
  USD: {
    id: 'settings.unitOfAccount.currency.usd',
    defaultMessage: '!!!US dollar',
  },
  JPY: {
    id: 'settings.unitOfAccount.currency.jpy',
    defaultMessage: '!!!Japanese yen',
  },
  EUR: {
    id: 'settings.unitOfAccount.currency.eur',
    defaultMessage: '!!!Euro',
  },
  CNY: {
    id: 'settings.unitOfAccount.currency.cny',
    defaultMessage: '!!!Chinese Renminbi yuan',
  },
  KRW: {
    id: 'settings.unitOfAccount.currency.krw',
    defaultMessage: '!!!South Korean won',
  },
  BTC: {
    id: 'settings.unitOfAccount.currency.btc',
    defaultMessage: '!!!Bitcoin',
  },
  ETH: {
    id: 'settings.unitOfAccount.currency.eth',
    defaultMessage: '!!!Ethereum',
  },
  BRL: {
    id: 'settings.unitOfAccount.currency.brl',
    defaultMessage: '!!!Brazilian real',
  },
});

type GeneratedData = typeof GeneralSettingsPage.prototype.generated;

@observer
export default class GeneralSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onSelectUnitOfAccount: string => Promise<void> = async value => {
    const unitOfAccount =
      value === 'ADA' ? unitOfAccountDisabledValue : { enabled: true, currency: value };
    await this.generated.actions.profile.updateUnitOfAccount.trigger(unitOfAccount);
  };

  render(): Node {
    const { intl } = this.context;
    const profileStore = this.generated.stores.profile;
    const coinPriceStore = this.generated.stores.coinPriceStore;

    const isSubmittingLocale = profileStore.setProfileLocaleRequest.isExecuting;
    const isSubmittingUnitOfAccount =
      profileStore.setUnitOfAccountRequest.isExecuting ||
      coinPriceStore.refreshCurrentUnit.isExecuting;
    const { currentTheme } = profileStore;

    const currencies = profileStore.UNIT_OF_ACCOUNT_OPTIONS.map(c => {
      const name = intl.formatMessage(currencyLabels[c.symbol]);
      return {
        value: c.symbol,
        label: `${c.symbol} - ${name}`,
        name,
        price: coinPriceStore.getCurrentPrice('ADA', c.symbol),
        svg: c.svg,
      };
    });
    currencies.unshift({
      value: 'ADA',
      label: 'ADA - Cardano',
      name: 'Cardano',
      native: true,
      svg: AdaCurrency,
    });

    const unitOfAccountValue = profileStore.unitOfAccount.enabled
      ? profileStore.unitOfAccount.currency
      : 'ADA';

    return (
      <Box sx={{ pb: profileStore.isRevampTheme ? '50px' : '0px' }}>
        {profileStore.isRevampTheme && (
          <Typography variant="h5" fontWeight={500} mb="24px">
            {intl.formatMessage(settingsMenuMessages.general)}
          </Typography>
        )}
        <GeneralSettings
          onSelectLanguage={this.generated.actions.profile.updateLocale.trigger}
          isSubmitting={isSubmittingLocale}
          languages={profileStore.LANGUAGE_OPTIONS}
          currentLocale={profileStore.currentLocale}
          error={profileStore.setProfileLocaleRequest.error}
        />
        <UnitOfAccountSettings
          onSelect={this.onSelectUnitOfAccount}
          isSubmitting={isSubmittingUnitOfAccount}
          currencies={currencies}
          currentValue={unitOfAccountValue}
          error={profileStore.setUnitOfAccountRequest.error}
          lastUpdatedTimestamp={coinPriceStore.lastUpdateTimestamp}
        />
        <ThemeSettingsBlock
          currentTheme={currentTheme}
          onSubmit={(theme: string) => {
            if (theme === THEMES.YOROI_REVAMP) {
              const { wallets } = this.generated.stores;
              const publicDeriver = wallets.selected;
              const publicDerivers = wallets.publicDerivers;

              if (publicDeriver == null && publicDerivers.length !== 0) {
                const lastSelectedWallet = wallets.getLastSelectedWallet();
                this.generated.actions.wallets.setActiveWallet.trigger({
                  wallet: lastSelectedWallet ?? publicDerivers[0],
                });
              }
            }
            this.generated.actions.profile.updateTheme.trigger({ theme });
          }}
          onExternalLinkClick={handleExternalLinkClick}
        />
        <AboutYoroiSettingsBlock wallet={this.generated.stores.wallets.selected} />
      </Box>
    );
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
        isRevampTheme: boolean,
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
      throw new Error(`${nameof(GeneralSettingsPage)} no way to generated props`);
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
          isRevampTheme: profileStore.isRevampTheme,
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
