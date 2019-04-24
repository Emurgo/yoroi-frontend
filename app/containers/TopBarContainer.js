// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TopBar from '../components/topbar/TopBar';
import WalletTopbarTitle from '../components/topbar/WalletTopbarTitle';
import type { InjectedProps } from '../types/injectedPropsType';
import environment from '../environment';
import resolver from '../utils/imports';
import {
  Logger,
  stringifyError
} from '../utils/logging';

const { formattedWalletAmount } = resolver('utils/formatters');

type Props = InjectedProps;

@observer
export default class TopBarContainer extends Component<Props> {

  render() {
    try {
      const { actions, stores } = this.props;
      const { app, topbar } = stores;
      const { isClassicThemeActive } = this.props.stores.profile;

      const title = (<WalletTopbarTitle
        wallet={stores.substores[environment.API].wallets.active}
        currentRoute={app.currentRoute}
        formattedWalletAmount={formattedWalletAmount}
      />);
      return (
        <TopBar
          title={title}
          onCategoryClicked={category => {
            actions.topbar.activateTopbarCategory.trigger({ category });
          }}
          categories={topbar.CATEGORIES}
          activeTopbarCategory={topbar.activeTopbarCategory}
          isClassicThemeActive={isClassicThemeActive}
        />
      );
    } catch (error) {
      Logger.error(`TopBarContainer::render::${stringifyError(error)}`);
      return null;
    }
  }
}
