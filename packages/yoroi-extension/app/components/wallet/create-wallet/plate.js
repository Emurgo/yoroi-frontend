// @flow

import { generateShelleyPlate } from '../../../api/ada/lib/cardanoCrypto/plate';
import { generateWalletRootKey } from '../../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { HARD_DERIVATION_START } from '../../../config/numbersConfig';
import { NUMBER_OF_VERIFIED_ADDRESSES } from '../../../stores/toplevel/WalletRestoreStore';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { useMemo } from 'react';

export function usePlate(recoveryPhrase, selectedNetwork) {
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
