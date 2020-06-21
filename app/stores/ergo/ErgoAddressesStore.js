// @flow

import Store from '../base/Store';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { AddressTypeStore } from '../toplevel/AddressesStore';
import {
  asHasUtxoChains, asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type { StandardAddress, } from '../../types/AddressFilterTypes';
import type { CoreAddressT } from '../../api/ada/lib/storage/database/primitives/enums';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { ChainDerivations } from '../../config/numbersConfig';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { AddressFilter, AddressGroupTypes, AddressSubgroup } from '../../types/AddressFilterTypes';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { Cip1852Wallet } from '../../api/ada/lib/storage/models/Cip1852Wallet/wrapper';
import { Bip44DerivationLevels } from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';

export default class ErgoAddressesStore extends Store {

  allAddressesForDisplay: AddressTypeStore<StandardAddress>;
  externalForDisplay: AddressTypeStore<StandardAddress>;
  internalForDisplay: AddressTypeStore<StandardAddress>;

  setup(): void {
    super.setup();

    this.allAddressesForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: (request) => this.stores.addresses._wrapForAllAddresses({
        ...request,
        storeToFilter: this.allAddressesForDisplay,
      }),
      name: {
        subgroup: AddressSubgroup.all,
        group: AddressGroupTypes.p2pk,
      },
      shouldHide: (publicDeriver, _store) => {
        const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
        if (withLevels == null) return true;
        const parent = withLevels.getParent();
        if (!(parent instanceof Bip44Wallet || parent instanceof Cip1852Wallet)) {
          return false;
        }
        // don't show this if public deriver level < Account
        return parent.getPublicDeriverLevel() > Bip44DerivationLevels.ACCOUNT.level;
      },
      validFilters: [
        AddressFilter.None,
        AddressFilter.Unused,
        AddressFilter.Used,
        AddressFilter.HasBalance,
      ],
    });
    this.externalForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: async (request) => this.stores.addresses._createAddressIfNeeded({
        publicDeriver: request.publicDeriver,
        genAddresses: () => this.stores.addresses._wrapForChainAddresses({
          ...request,
          storeToFilter: this.externalForDisplay,
          chainsRequest: { chainId: ChainDerivations.EXTERNAL },
        }),
      }),
      name: {
        subgroup: AddressSubgroup.external,
        group: AddressGroupTypes.p2pk,
      },
      shouldHide: (_publicDeriver, store) => store.all.length === 0,
      validFilters: [
        AddressFilter.None,
        AddressFilter.Unused,
        AddressFilter.Used,
        AddressFilter.HasBalance,
      ],
    });
    this.internalForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: (request) => this.stores.addresses._wrapForChainAddresses({
        ...request,
        storeToFilter: this.internalForDisplay,
        chainsRequest: { chainId: ChainDerivations.INTERNAL },
      }),
      name: {
        subgroup: AddressSubgroup.internal,
        group: AddressGroupTypes.p2pk,
      },
      shouldHide: (_publicDeriver, store) => store.all.length === 0,
      validFilters: [
        AddressFilter.None,
        AddressFilter.Unused,
        AddressFilter.Used,
        AddressFilter.HasBalance,
      ],
    });
  }

  addObservedWallet: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    const withHasUtxoChains = asHasUtxoChains(publicDeriver);
    if (withHasUtxoChains == null) {
      this.allAddressesForDisplay.addObservedWallet(publicDeriver);
    } else {
      this.externalForDisplay.addObservedWallet(publicDeriver);
      this.internalForDisplay.addObservedWallet(publicDeriver);
    }
  }
  refreshAddressesFromDb: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    const withHasUtxoChains = asHasUtxoChains(publicDeriver);
    if (withHasUtxoChains == null) {
      await this.allAddressesForDisplay.refreshAddressesFromDb(publicDeriver);
    } else {
      await this.externalForDisplay.refreshAddressesFromDb(publicDeriver);
      await this.internalForDisplay.refreshAddressesFromDb(publicDeriver);
    }
  }

  getStoresForWallet: (
    PublicDeriver<>,
  ) => Array<AddressTypeStore<StandardAddress>> = (publicDeriver) => {
    const withHasUtxoChains = asHasUtxoChains(publicDeriver);

    const stores = [];
    if (withHasUtxoChains == null) {
      stores.push(this.allAddressesForDisplay);
    } else {
      stores.push(this.externalForDisplay);
      stores.push(this.internalForDisplay);
    }
    return stores;
  }

  getAddressTypesForWallet: (
    PublicDeriver<>,
  ) => Array<CoreAddressT> = (_publicDeriver) => {
    const types = [CoreAddressTypes.ERGO_P2PK];
    return types;
  }

  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeToFilter: AddressTypeStore<StandardAddress>,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    return request.addresses;
  }
}
