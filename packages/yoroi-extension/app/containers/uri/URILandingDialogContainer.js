// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import URILandingDialog from '../../components/uri/URILandingDialog';
import URIVerifyDialog from '../../components/uri/URIVerifyDialog';
import URIInvalidDialog from '../../components/uri/URIInvalidDialog';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import type { StoresProps } from '../../stores';

type Props = {|
  ...StoresProps,
  +onClose: void => void,
  +onConfirm: void => void,
  +hasFirstSelectedWallet: boolean,
|};

@observer
export default class URILandingDialogContainer extends Component<Props> {

  @observable showDisclaimer: boolean = true;

  @action
  toggleShowDisclaimer: void => void = () => {
    this.showDisclaimer = !this.showDisclaimer;
  }

  onSubmit: void => void = () => {
    this.toggleShowDisclaimer();
  };

  onVerifiedSubmit: void => void = () => {
    this.props.onConfirm();
  };

  onCancel: void => void = () => {
    this.props.onClose();
  }

  render(): Node {
    if (!this.props.stores.loading.uriParams || !this.props.hasFirstSelectedWallet) {
      return (
        <URIInvalidDialog
          onClose={this.onCancel}
          onSubmit={this.onCancel}
          address={
            this.props.stores.loading.uriParams
              ? this.props.stores.loading.uriParams.address
              : null
          }
        />
      );
    }
    // assert not null
    const uriParams = this.props.stores.loading.uriParams;

    const network = networks.CardanoMainnet; // todo: uri scheme for other networks

    if (!this.showDisclaimer) {
      return (
        <URIVerifyDialog
          onSubmit={this.onVerifiedSubmit}
          onBack={this.toggleShowDisclaimer}
          onCancel={this.onCancel}
          uriParams={uriParams}
          selectedExplorer={this.props.stores.explorers.selectedExplorer
            .get(network.NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
          }
          unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
        />
      );
    }

    return (
      <URILandingDialog
        onSubmit={this.toggleShowDisclaimer}
        onClose={this.onCancel}
      />
    );
  }
}
