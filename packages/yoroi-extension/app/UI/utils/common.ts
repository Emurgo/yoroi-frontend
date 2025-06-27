import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { getNetworkById, getCardanoHaskellBaseConfigCombined } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { truncateAddressShort, truncateAddress } from '../../utils/formatters';

export const deriveRewardAddressFromAddress = (address: string, networkId: number): string => {
  try {
    const network = getNetworkById(networkId);
    const networkConfig = getCardanoHaskellBaseConfigCombined(network);

    const from_bech32 = RustModule.WalletV4.Address.from_bech32(address);
    const baseAddress = RustModule.WalletV4.BaseAddress.from_address(from_bech32);
    const stakeCred = baseAddress?.stake_cred();
    const stakeCredential = RustModule.WalletV4.RewardAddress.new(networkConfig.ChainNetworkId, stakeCred);
    const rewardAddress = stakeCredential.to_address();
    const rewardAddrAsAddress = rewardAddress.to_bech32();

    if (typeof rewardAddrAsAddress !== 'string') throw new Error('Its not possible to derive reward address');
    return rewardAddrAsAddress;
  } catch (error) {
    console.error('[deriveRewardAddressFromAddress] input=' + address, error);
    throw error;
  }
};

export function addressHexToBech32(hex: string): string {
  return RustModule.WasmScope(Module => Module.WalletV4.Address.from_hex(hex).to_bech32());
}

type Truncate = 'short' | 'long' | 'none';

export function displayAddrTruncated(addr: string, truncate: Truncate = 'none'): string {
  if (truncate === 'short') {
    return truncateAddressShort(addr);
  }

  if (truncate === 'long') {
    return truncateAddress(addr);
  }

  return addr;
}
