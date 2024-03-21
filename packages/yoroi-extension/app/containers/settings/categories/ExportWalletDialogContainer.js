// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import ExportPublicKeyDialog from '../../../components/wallet/settings/ExportPublicKeyDialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetPublicKey,
} from '../../../api/ada/lib/storage/models/PublicDeriver/traits';

import type { StoresAndActionsProps } from '../../../types/injectedProps.types';

type Props = {|
  ...StoresAndActionsProps,
  publicDeriver: void | PublicDeriver<>,
|};

@observer
export default class ExportWalletDialogContainer extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { selected } = this.props.stores.wallets;
    if (selected == null) {
      return null;
    }
    const withPublicKey = asGetPublicKey(selected);
    if (withPublicKey == null) {
      return null;
    }
    const { publicKey } = this.props.stores.wallets.getPublicKeyCache(withPublicKey);
    return (
      <ExportPublicKeyDialog
        onClose={this.props.actions.dialogs.closeActiveDialog.trigger}
        publicKeyHex={publicKey}
        pathToPublic={withPublicKey.pathToPublic}
      />
    );
  }
}
