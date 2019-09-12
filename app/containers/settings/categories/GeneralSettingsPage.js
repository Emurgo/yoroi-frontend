// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import ExplorerSettings from '../../../components/settings/categories/general-setting/ExplorerSettings';
import CoinPriceCurrencySettings from '../../../components/settings/categories/general-setting/CoinPriceCurrencySettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import UriSettingsBlock from '../../../components/settings/categories/general-setting/UriSettingsBlock';
import registerProtocols from '../../../uri-protocols';
import environment from '../../../environment';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import type { ExplorerType } from '../../../domain/Explorer';
import { Explorer, explorerInfo } from '../../../domain/Explorer';
import { coinPriceCurrencyDisabledValue } from '../../../types/coinPriceType';

@observer
export default class GeneralSettingsPage extends Component<InjectedProps> {

  onSelectLanguage = (values: { locale: string }) => {
    this.props.actions.profile.updateLocale.trigger(values);
  };

  onSelecExplorer = (values: { explorer: ExplorerType }) => {
    this.props.actions.profile.updateSelectedExplorer.trigger(values);
  };

  selectTheme = (values: { theme: string }) => {
    this.props.actions.profile.updateTheme.trigger(values);
  };

  exportTheme = () => {
    this.props.actions.profile.exportTheme.trigger();
  };

  getThemeVars = (theme: { theme: string }) => (
    this.props.stores.profile.getThemeVars(theme)
  )

  hasCustomTheme = (): boolean => (
    this.props.stores.profile.hasCustomTheme()
  )

  onSelectCoinPriceCurrency = (value: { selected: string }) => {
    const currency = (value === 'ADA') ? 
      coinPriceCurrencyDisabledValue :
      { enabled: true, currency: value };
    this.props.actions.profile.updateCoinPriceCurrency.trigger(currency);
  };

  render() {
    const {
      setSelectedExplorerRequest,
      setProfileLocaleRequest,
      LANGUAGE_OPTIONS,
      currentLocale,
      selectedExplorer,
      UNIT_OF_ACCOUNT_OPTIONS,
      unitOfAccount,
      setCoinPriceCurrencyRequest,
    } = this.props.stores.profile;
    const isSubmittingLocale = setProfileLocaleRequest.isExecuting;
    const isSubmittingExplorer = setSelectedExplorerRequest.isExecuting;
    const isSubmittingCoinPriceCurrency = setCoinPriceCurrencyRequest.isExecuting;
    const explorerOptions = Object.keys(Explorer)
      .map(key => ({
        value: Explorer[key],
        label: explorerInfo[Explorer[key]].name,
      }));
    const { currentTheme } = this.props.stores.profile;

    const uriSettings = environment.userAgentInfo.canRegisterProtocol()
      ? (
        <UriSettingsBlock
          registerUriScheme={() => registerProtocols()}
          isFirefox={environment.userAgentInfo.isFirefox}
        />
      )
      : null;

    const coinPriceStore = this.props.stores.substores[environment.API].coinPriceStore;

    const currencies = UNIT_OF_ACCOUNT_OPTIONS.map(c => (
      { value: c.symbol, label: `${c.symbol} - ${c.label}`, name: c.label,
        price: coinPriceStore.getCurrentPrice('ADA', c.symbol), svg: c.svg
      }
    ));
    currencies.unshift({ value: 'ADA', label: 'ADA - Cardano', name: 'Cardano',
      native: true, svg: require('../../../assets/images/currencies/ADA.inline.svg') });

    const coinPriceCurrencyValue = unitOfAccount.enabled ? unitOfAccount.currency : 'ADA';
      
    return (
      <div>
        <GeneralSettings
          onSelectLanguage={this.onSelectLanguage}
          isSubmitting={isSubmittingLocale}
          languages={LANGUAGE_OPTIONS}
          currentLocale={currentLocale}
          error={setProfileLocaleRequest.error}
        />
        <ExplorerSettings
          onSelectExplorer={this.onSelecExplorer}
          isSubmitting={isSubmittingExplorer}
          explorers={explorerOptions}
          selectedExplorer={selectedExplorer}
          error={setSelectedExplorerRequest.error}
        />
        {uriSettings}
        <CoinPriceCurrencySettings
          onSelect={this.onSelectCoinPriceCurrency}
          isSubmitting={isSubmittingCoinPriceCurrency}
          currencies={currencies}
          currentValue={coinPriceCurrencyValue}
          error={setCoinPriceCurrencyRequest.error}
          lastUpdatedTimestamp={coinPriceStore.lastUpdateTimestamp}
        />
        <ThemeSettingsBlock
          currentTheme={currentTheme}
          selectTheme={this.selectTheme}
          getThemeVars={this.getThemeVars}
          exportTheme={this.exportTheme}
          hasCustomTheme={this.hasCustomTheme}
          onExternalLinkClick={handleExternalLinkClick}
        />
        <AboutYoroiSettingsBlock />
      </div>
    );
  }

}
