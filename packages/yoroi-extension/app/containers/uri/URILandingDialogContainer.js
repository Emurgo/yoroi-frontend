// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';

import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import URILandingDialog from '../../components/uri/URILandingDialog';
import URIVerifyDialog from '../../components/uri/URIVerifyDialog';
import URIInvalidDialog from '../../components/uri/URIInvalidDialog';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UriParams } from '../../utils/URIHandling';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';

export type GeneratedData = typeof URILandingDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
  +onConfirm: void => void,
  +firstSelectedWallet: null | PublicDeriver<>,
|};

@observer
export default class URILandingDialogContainer extends Component<Props> {

  @observable showDisclaimer: boolean = true;

  @action
  toggleShowDisclaimer: void => void = () => {
    this.showDisclaimer = !this.showDisclaimer;
  }

  // <TODO:CHECK_LINT>
  // eslint-disable-next-line react/no-unused-class-component-methods
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
    if (!this.generated.stores.loading.uriParams || this.generated.firstSelectedWallet == null) {
      return (
        <URIInvalidDialog
          onClose={this.onCancel}
          onSubmit={this.onCancel}
          address={
            this.generated.stores.loading.uriParams
              ? this.generated.stores.loading.uriParams.address
              : null
          }
        />
      );
    }
    // assert not null
    const uriParams = this.generated.stores.loading.uriParams;

    const network = networks.CardanoMainnet; // todo: uri scheme for other networks

    if (!this.showDisclaimer) {
      return (
        <URIVerifyDialog
          onSubmit={this.onVerifiedSubmit}
          onBack={this.toggleShowDisclaimer}
          onCancel={this.onCancel}
          uriParams={uriParams}
          selectedExplorer={this.generated.stores.explorers.selectedExplorer
            .get(network.NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
          }
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
        />
      );
    }

    return (
      <URILandingDialog
        onSubmit={this.toggleShowDisclaimer}
        onClose={this.onCancel}
        classicTheme={this.generated.stores.profile.isClassicTheme}
      />
    );
  }

  @computed get generated(): {|
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?string
      |},
      loading: {| uriParams: ?UriParams |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      profile: {|
        isClassicTheme: boolean,
        unitOfAccount: UnitOfAccountSettingType
      |},
    |},
    firstSelectedWallet: null | PublicDeriver<>
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(URILandingDialogContainer)} no way to generated props`);
    }
    const { stores, firstSelectedWallet } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        loading: {
          uriParams: stores.loading.uriParams,
        },
      },
      firstSelectedWallet,
    });
  }
}
