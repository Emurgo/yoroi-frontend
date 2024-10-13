// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import type { SidebarCategoryRevamp } from '../stores/stateless/sidebarCategories';
import { allCategoriesRevamp } from '../stores/stateless/sidebarCategories';
import SidebarRevamp from '../components/topbar/SidebarRevamp';
import { ROUTES } from '../routes-config';
import { runInAction } from 'mobx';

type State = {|
  featureFlags: { [string]: boolean },
|};

@observer
export default class SidebarContainer extends Component<StoresAndActionsProps, State> {

  state: State = {
    featureFlags: {},
  };

  toggleSidebar: void => Promise<void> = async () => {
    await this.props.stores.profile.toggleSidebar();
  };

  componentDidMount(): * {
    allCategoriesRevamp.forEach(c => {
      const feature = c.featureFlagName;
      if (feature != null) {
        this.props.stores.wallets.getRemoteFeatureFlag(feature)
          .then((flag: ?boolean) => {
            if (flag) {
              runInAction(() => {
                this.setState(s => ({
                  featureFlags: { ...s.featureFlags, [feature]: true },
                }));
              });
            }
            return null;
          })
          .catch(e => {
            console.error('Failed to resolve remote flag for feature: ' + feature, e);
          });
      }
    })
  }

  categoryFeatureFlagEnabled(category: SidebarCategoryRevamp): boolean {
    return category.featureFlagName == null || this.state.featureFlags[category.featureFlagName] === true;
  }

  render(): Node {
    const { stores } = this.props;
    return (
      <SidebarRevamp
        onLogoClick={() => {
          stores.app.goToRoute({
            route: ROUTES.WALLETS.ROOT,
          });
        }}
        onCategoryClicked={category => {
          stores.app.goToRoute({
            route: category.route,
          });
        }}
        isActiveCategory={category => stores.app.currentRoute.startsWith(category.route)}
        categories={allCategoriesRevamp.filter(category =>
          category.isVisible({
            hasAnyWallets: this.props.stores.wallets.hasAnyWallets === true,
            selected: this.props.stores.wallets.selected,
            currentRoute: this.props.stores.app.currentRoute,
            isRewardWallet: (wallet) =>
              stores.delegation.isRewardWallet(wallet.publicDeriverId),
          })
          && this.categoryFeatureFlagEnabled(category)
        )}
      />
    );
  }
}
