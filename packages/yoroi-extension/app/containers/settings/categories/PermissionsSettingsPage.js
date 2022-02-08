// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import PermissionsPage from '../../../components/settings/categories/PermissionsPage';

const currencyLabels = defineMessages({
});

type GeneratedData = typeof PermissionsSettingsPage.prototype.generated;

@observer
export default class PermissionsSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {

    return (
      <PermissionsPage />
    );
  }

  @computed get generated(): {|
    actions: {|
      walletSettings: {|
        requestTabPermission: {|
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
        },
      },
    });
  }
}
