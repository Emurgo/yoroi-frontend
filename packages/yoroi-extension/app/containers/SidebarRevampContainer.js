// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import SidebarRevamp from '../components/topbar/SidebarRevamp';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import { allCategoriesRevamp } from '../stores/stateless/sidebarCategories';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';

export type GeneratedData = typeof SidebarRevampContainer.prototype.generated;

@observer
export default class SidebarRevampContainer extends Component<InjectedOrGenerated<GeneratedData>> {
  render(): Node {
    return (
      <SidebarRevamp
        onCategoryClicked={category => {
          this.generated.actions.router.goToRoute.trigger({
            route: category.route,
          });
        }}
        isActiveCategory={category =>
          this.generated.stores.app.currentRoute.startsWith(category.route)
        }
        categories={allCategoriesRevamp.filter(category =>
          category.isVisible({
            hasAnyWallets: this.generated.stores.wallets.hasAnyWallets,
            selected: this.generated.stores.wallets.selected,
            currentRoute: this.generated.stores.app.currentRoute,
          })
        )}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      app: {| currentRoute: string |},
      wallets: {|
        hasAnyWallets: boolean,
        selected: null | PublicDeriver<>,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SidebarRevampContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
        },
        wallets: {
          selected: stores.wallets.selected,
          hasAnyWallets: stores.wallets.hasAnyWallets,
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
    });
  }
}
