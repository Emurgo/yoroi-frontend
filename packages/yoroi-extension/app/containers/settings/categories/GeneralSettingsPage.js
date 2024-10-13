// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import UnitOfAccountSettings from '../../../components/settings/categories/general-setting/UnitOfAccountSettings';
import { ReactComponent as AdaCurrency } from '../../../assets/images/currencies/ADA.inline.svg';
import { unitOfAccountDisabledValue } from '../../../types/unitOfAccountType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
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

@observer
export default class GeneralSettingsPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onSelectUnitOfAccount: string => Promise<void> = async value => {
    const unitOfAccount =
      value === 'ADA' ? unitOfAccountDisabledValue : { enabled: true, currency: value };
    await this.props.stores.profile.updateUnitOfAccount(unitOfAccount);
  };

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.props;
    const profileStore = stores.profile;
    const coinPriceStore = stores.coinPriceStore;

    const isSubmittingLocale = profileStore.setProfileLocaleRequest.isExecuting;
    const isSubmittingUnitOfAccount =
      profileStore.setUnitOfAccountRequest.isExecuting;

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
      <Box sx={{ pb: '50px' }}>
        <Typography component="div" variant="h5" fontWeight={500} mb="24px">
          {intl.formatMessage(settingsMenuMessages.general)}
        </Typography>
        <GeneralSettings
          onSelectLanguage={stores.profile.updateLocale}
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
        <ThemeSettingsBlock />
        <AboutYoroiSettingsBlock wallet={stores.wallets.selected} />
      </Box>
    );
  }
}
