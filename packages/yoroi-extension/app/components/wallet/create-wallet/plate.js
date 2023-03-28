// @flow

import { generateShelleyPlate } from '../../../api/ada/lib/cardanoCrypto/plate';
import { generateWalletRootKey } from '../../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { HARD_DERIVATION_START } from '../../../config/numbersConfig';
import { NUMBER_OF_VERIFIED_ADDRESSES } from '../../../stores/toplevel/WalletRestoreStore';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { useMemo } from 'react';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { WalletChecksum } from '@emurgo/cip4-js';

export function usePlate(
  recoveryPhrase: Array<string>,
  selectedNetwork: $ReadOnly<NetworkRow>
): WalletChecksum {
  return useMemo(() => {
    const network = selectedNetwork || networks.CardanoMainnet;
    const { plate } = generateShelleyPlate(
      generateWalletRootKey(recoveryPhrase.join(' ')),
      0 + HARD_DERIVATION_START, // Account Index
      NUMBER_OF_VERIFIED_ADDRESSES,
      Number.parseInt(network.BaseConfig[0].ChainNetworkId, 10)
    );
    return plate;
  }, [selectedNetwork, recoveryPhrase]);
}
