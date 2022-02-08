// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import PermissionsPage from '../../../components/settings/categories/PermissionsPage';


type GeneratedData = typeof PermissionsSettingsPage.prototype.generated;

@observer
export default class PermissionsSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  render(): Node {
    const { stores, actions } = this.generated
    return (
      <PermissionsPage
        isDappEnabled={stores.walletSettings.isDappEnabled}
        requestTabPermission={actions.walletSettings.requestTabPermission.trigger}
        removeTabPermission={actions.walletSettings.removeTabPermission.trigger}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      walletSettings: {|
        requestTabPermission: {|
          trigger: (params: void) => void,
        |},
        removeTabPermission: {|
            trigger: (params: void) => void,
        |}
      |},
    |},
    stores: {|
      walletSettings: {|
        isDappEnabled: boolean,
      |},
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(PermissionsSettingsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        walletSettings: {
            isDappEnabled: stores.walletSettings.isDappEnabled,
        },
      },
      actions: {
        walletSettings: {
            requestTabPermission: { trigger: actions.walletSettings.requestTabPermission.trigger },
            removeTabPermission: { trigger: actions.walletSettings.removeTabPermission.trigger },
        },
      },
    });
  }
}
