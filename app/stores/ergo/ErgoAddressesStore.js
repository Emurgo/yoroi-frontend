// @flow

import Store from '../base/Store';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asHasUtxoChains, asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type { StandardAddress, AddressTypeName, } from '../../types/AddressFilterTypes';
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
  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeName: AddressTypeName,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    return request.addresses;
  }
}
