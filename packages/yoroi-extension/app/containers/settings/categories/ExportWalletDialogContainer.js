// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import ExportPublicKeyDialog from '../../../components/wallet/settings/ExportPublicKeyDialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import type { StoresProps } from '../../../stores';

type Props = {|
  ...StoresProps,
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
    return (
      <ExportPublicKeyDialog
        onClose={this.props.stores.uiDialogs.closeActiveDialog}
        publicKeyHex={selected.publicKey}
        pathToPublic={selected.pathToPublic}
      />
    );
  }
}
