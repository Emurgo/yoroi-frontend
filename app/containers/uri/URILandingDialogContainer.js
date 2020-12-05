// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';

import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import URILandingDialog from '../../components/uri/URILandingDialog';
import URIVerifyDialog from '../../components/uri/URIVerifyDialog';
import URIInvalidDialog from '../../components/uri/URIInvalidDialog';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UriParams } from '../../utils/URIHandling';
import { getApiForNetwork, getApiMeta, } from '../../api/common/utils';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

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
    const selectedApiType = getApiForNetwork(network);

    const apiMeta = getApiMeta(selectedApiType);
    if (apiMeta == null) throw new Error(`${nameof(URILandingDialogContainer)} no API found`);

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore.getCurrentPrice(
          apiMeta.meta.primaryTicker,
          this.generated.stores.profile.unitOfAccount.currency
        )
      )
      : null;

    if (!this.showDisclaimer) {
      return (
        <URIVerifyDialog
          meta={{
            primaryTicker: apiMeta.meta.primaryTicker,
            decimalPlaces: apiMeta.meta.decimalPlaces.toNumber(),
          }}
          onSubmit={this.onVerifiedSubmit}
          onBack={this.toggleShowDisclaimer}
          onCancel={this.onCancel}
          uriParams={uriParams}
          selectedExplorer={this.generated.stores.explorers.selectedExplorer
            .get(network.NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
          }
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          coinPrice={coinPrice}
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
        getCurrentPrice: (from: string, to: string) => ?number
      |},
      loading: {| uriParams: ?UriParams |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
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
        loading: {
          uriParams: stores.loading.uriParams,
        },
      },
      firstSelectedWallet,
    });
  }
}
