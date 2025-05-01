// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, IntlContext } from 'react-intl';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import UnitOfAccountSettings from '../../../components/settings/categories/general-setting/UnitOfAccountSettings';
import BringCashbackSettings from '../../../components/settings/categories/general-setting/BringCashbackSettings';
import { ReactComponent as AdaCurrency } from '../../../assets/images/currencies/ADA.inline.svg';
import { unitOfAccountDisabledValue } from '../../../types/unitOfAccountType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, Typography } from '@mui/material';
import { settingsMenuMessages } from '../../../components/settings/menu/SettingsMenu';
import LocalStorageApi from '../../../api/localStorage/index';
import environment from '../../../environment';
import SwitchNetworkDialogContainer from './SwitchNetworkDialogContainer';
import type { StoresProps } from '../../../stores';

// $FlowIgnore[cannot-resolve-module]
import { ModalProvider } from '../../../UI/components/modals/ModalContext';
// $FlowIgnore[cannot-resolve-module]
import { ModalManager } from '../../../UI/components/modals/ModalManager';

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

const canUseSandbox = environment.isDev() || environment.isNightly();

@observer
export default class GeneralSettingsPage extends Component<StoresProps> {
  static contextType = IntlContext;
  componentDidMount() {
    const request = this.props.stores.wallets.getCashbackWalletRequest;
    request.reset();
    request.execute();
  }

  onSelectUnitOfAccount: (number, string) => Promise<void> = async (networkId, value) => {
    const localStorageApi = new LocalStorageApi();

    const unitOfAccount = value === 'ADA' ? unitOfAccountDisabledValue : { enabled: true, currency: value };
    await localStorageApi.unsetPortfolioFiatPair(networkId);
    await this.props.stores.profile.updateUnitOfAccount(unitOfAccount);
    await this.props.stores.transactions.updateUnitOfAccount();
  };

  onSelectBringCashbackWallet: number => Promise<void> = async value => {
    this.props.stores.wallets.setCashbackWallet(value);
  };

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.props;
    const profileStore = stores.profile;
    const coinPriceStore = stores.coinPriceStore;
    const { wallets, getCashbackWalletRequest } = stores.wallets;
    const selectedWallet = stores.wallets.selected;

    const isSubmittingLocale = profileStore.setProfileLocaleRequest.isExecuting;
    const isSubmittingUnitOfAccount = profileStore.setUnitOfAccountRequest.isExecuting;

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

    const unitOfAccountValue = profileStore.unitOfAccount.enabled ? profileStore.unitOfAccount.currency : 'ADA';

    return (
      <ModalProvider>
        <ModalManager />
        <Box sx={{ pb: '50px' }}>
          <Typography component="div" variant="h5" fontWeight={500} mb="24px" color="ds.text_gray_medium">
            {intl.formatMessage(settingsMenuMessages.general)}
          </Typography>
          <GeneralSettings
            onSelectLanguage={stores.profile.updateLocale}
            isSubmitting={isSubmittingLocale}
            languages={profileStore.LANGUAGE_OPTIONS}
            currentLocale={profileStore.currentLocale}
            error={profileStore.setProfileLocaleRequest.error}
          />
          <BringCashbackSettings
            onSelect={this.onSelectBringCashbackWallet}
            isSubmitting={false}
            // $FlowFixMe this is apparently correct, flow is out of its mind
            cardanoWallets={wallets.filter(w => w.type !== 'trezor')}
            // $FlowFixMe this is apparently correct, flow is out of its mind
            currentValue={getCashbackWalletRequest.result?.publicDeriverId || ''}
            isUseSandbox={profileStore.getBringSandboxRequest.result}
            onSetUseSandbox={
              canUseSandbox
                ? async useSandbox => {
                  await profileStore.setBringSandboxRequest.execute(useSandbox);
                  await profileStore.getBringSandboxRequest.execute();
                }
                : null
            }
            error={null}
          />
          {selectedWallet && (
            <UnitOfAccountSettings
              onSelect={val => this.onSelectUnitOfAccount(selectedWallet.networkId, val)}
              isSubmitting={isSubmittingUnitOfAccount}
              currencies={currencies}
              currentValue={unitOfAccountValue}
              error={profileStore.setUnitOfAccountRequest.error}
              lastUpdatedTimestamp={coinPriceStore.lastUpdateTimestamp}
            />
          )}
          <ThemeSettingsBlock />
          <AboutYoroiSettingsBlock
            wallet={stores.wallets.selected}
            onSwitchNetwork={() =>
              stores.uiDialogs.open({
                dialog: SwitchNetworkDialogContainer,
              })
            }
          />
        </Box>
      </ModalProvider>
    );
}
}
