// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import ExplorerSettings from '../../../components/settings/categories/general-setting/ExplorerSettings';
import UnitOfAccountSettings from '../../../components/settings/categories/general-setting/UnitOfAccountSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import UriSettingsBlock from '../../../components/settings/categories/general-setting/UriSettingsBlock';
import registerProtocols from '../../../uri-protocols';
import environment from '../../../environment';
import { getExplorers } from '../../../domain/Explorer';
import { unitOfAccountDisabledValue } from '../../../types/unitOfAccountType';
import AdaCurrency from '../../../assets/images/currencies/ADA.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ExplorerType } from '../../../domain/Explorer';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import LocalizableError from '../../../i18n/LocalizableError';
import {
  PublicDeriver,
} from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import NoWalletMessage from '../../../components/wallet/settings/NoWalletMessage';
import { CoinTypes, } from '../../../config/numbersConfig';

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
});

type GeneratedData = typeof BlockchainSettingsPage.prototype.generated;

@observer
export default class BlockchainSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  onSelectUnitOfAccount: string => Promise<void> = async (value) => {
    const unitOfAccount = (value === 'ADA')
      ? unitOfAccountDisabledValue
      : { enabled: true, currency: value };
    await this.generated.actions.profile.updateUnitOfAccount.trigger(unitOfAccount);
  };

  render(): Node {
    const walletsStore = this.generated.stores.wallets;
    if (walletsStore.selected == null) {
      return (<NoWalletMessage />);
    }
    const coinType = walletsStore.selected.getParent().getCoinType();

    const profileStore = this.generated.stores.profile;
    const coinPriceStore = this.generated.stores.coinPriceStore;

    const isSubmittingExplorer = profileStore.setSelectedExplorerRequest.isExecuting;
    const isSubmittingUnitOfAccount = profileStore.setUnitOfAccountRequest.isExecuting
      || coinPriceStore.refreshCurrentUnit.isExecuting;
    const explorerOptions = getExplorers();

    const uriSettings = (
      coinType === CoinTypes.CARDANO &&
      !environment.isJormungandr() &&
      this.generated.canRegisterProtocol()
    )
      ? (
        <UriSettingsBlock
          registerUriScheme={() => registerProtocols()}
          isFirefox={environment.userAgentInfo.isFirefox}
        />
      )
      : null;

    const currencies = profileStore.UNIT_OF_ACCOUNT_OPTIONS.map(c => {
      const name = this.context.intl.formatMessage(currencyLabels[c.symbol]);
      return {
        value: c.symbol,
        label: `${c.symbol} - ${name}`,
        name,
        price: coinPriceStore.getCurrentPrice('ADA', c.symbol),
        svg: c.svg
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
      <>
        <ExplorerSettings
          onSelectExplorer={this.generated.actions.profile.updateSelectedExplorer.trigger}
          isSubmitting={isSubmittingExplorer}
          explorers={explorerOptions}
          selectedExplorer={profileStore.selectedExplorer}
          error={profileStore.setSelectedExplorerRequest.error}
        />
        {uriSettings}
        {(!environment.isProduction() || environment.isTest()) &&
          <UnitOfAccountSettings
            onSelect={this.onSelectUnitOfAccount}
            isSubmitting={isSubmittingUnitOfAccount}
            currencies={currencies}
            currentValue={unitOfAccountValue}
            error={profileStore.setUnitOfAccountRequest.error}
            lastUpdatedTimestamp={coinPriceStore.lastUpdateTimestamp}
          />
        }
      </>
    );
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        updateSelectedExplorer: {|
          trigger: (params: {|
            explorer: ExplorerType
          |}) => Promise<void>
        |},
        updateUnitOfAccount: {|
          trigger: (
            params: UnitOfAccountSettingType
          ) => Promise<void>
        |}
      |}
    |},
    canRegisterProtocol: () => boolean,
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (
          from: string,
          to: string
        ) => ?number,
        lastUpdateTimestamp: null | number,
        refreshCurrentUnit: {| isExecuting: boolean |}
      |},
      profile: {|
        UNIT_OF_ACCOUNT_OPTIONS: Array<{|
          svg: string,
          symbol: string
        |}>,
        selectedExplorer: ExplorerType,
        setSelectedExplorerRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean
        |},
        setUnitOfAccountRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean
        |},
        unitOfAccount: UnitOfAccountSettingType
      |},
      wallets: {|
        selected: null | PublicDeriver<>
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(BlockchainSettingsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;
    return Object.freeze({
      stores: {
        profile: {
          setSelectedExplorerRequest: {
            isExecuting: profileStore.setSelectedExplorerRequest.isExecuting,
            error: profileStore.setSelectedExplorerRequest.error,
          },
          selectedExplorer: profileStore.selectedExplorer,
          UNIT_OF_ACCOUNT_OPTIONS: profileStore.UNIT_OF_ACCOUNT_OPTIONS,
          unitOfAccount: profileStore.unitOfAccount,
          setUnitOfAccountRequest: {
            error: profileStore.setUnitOfAccountRequest.error,
            isExecuting: profileStore.setUnitOfAccountRequest.isExecuting,
          },
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
          lastUpdateTimestamp: stores.coinPriceStore.lastUpdateTimestamp,
          refreshCurrentUnit: {
            isExecuting: stores.coinPriceStore.refreshCurrentUnit.isExecuting,
          },
        },
        wallets: {
          selected: stores.wallets.selected,
        },
      },
      actions: {
        profile: {
          updateSelectedExplorer: { trigger: actions.profile.updateSelectedExplorer.trigger },
          updateUnitOfAccount: { trigger: actions.profile.updateUnitOfAccount.trigger },
        },
      },
      canRegisterProtocol: environment.userAgentInfo.canRegisterProtocol,
    });
  }
}
