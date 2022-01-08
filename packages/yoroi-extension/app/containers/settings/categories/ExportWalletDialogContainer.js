// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed, } from 'mobx';
import { intlShape } from 'react-intl';

import ExportPublicKeyDialog from '../../../components/wallet/settings/ExportPublicKeyDialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { IGetPublic } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { PublicKeyCache } from '../../../stores/toplevel/WalletStore';
import {
  asGetPublicKey,
} from '../../../api/ada/lib/storage/models/PublicDeriver/traits';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

export type GeneratedData = typeof ExportWalletDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  publicDeriver: void | PublicDeriver<>,
|};

@observer
export default class ExportWalletDialogContainer extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { selected } = this.generated.stores.wallets;
    if (selected == null) {
      return null;
    }
    const withPublicKey = asGetPublicKey(selected);
    if (withPublicKey == null) {
      return null;
    }
    const { publicKey } = this.generated.stores.wallets.getPublicKeyCache(withPublicKey);
    return (
      <ExportPublicKeyDialog
        onClose={this.generated.actions.dialogs.closeActiveDialog.trigger}
        publicKeyHex={publicKey}
        pathToPublic={withPublicKey.pathToPublic}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |}
      |},
    |},
    stores: {|
      wallets: {|
        getPublicKeyCache: IGetPublic => PublicKeyCache,
        selected: null | PublicDeriver<>,
      |},
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ExportWalletDialogContainer)} no way to generated props`);
    }
    const { actions, stores, } = this.props;
    return Object.freeze({
      stores: {
        wallets: {
          selected: stores.wallets.selected,
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
        },
      },
      actions: {
        dialogs: {
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
    });
  }
}
