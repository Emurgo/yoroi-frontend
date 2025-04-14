import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

export const deriveRewardAddressFromAddress = async (address: string, chainId: number): Promise<string> => {
  try {
    const from_bech32 = await RustModule.WalletV4.Address.from_bech32(address);
    const baseAddress = RustModule.WalletV4.BaseAddress.from_address(from_bech32);
    const stakeCred = baseAddress?.stake_cred();
    const stakeCredential = RustModule.WalletV4.RewardAddress.new(chainId === 0 ? 1 :0, stakeCred);
    const rewardAddress = stakeCredential.to_address();
    const rewardAddrAsAddress = rewardAddress.to_bech32();

    if (typeof rewardAddrAsAddress !== 'string') throw new Error('Its not possible to derive reward address');
    return rewardAddrAsAddress;
  } catch (error) {
    throw new Error('Its not possible to derive reward address');
  }
};

export function addressHexToBech32(hex: string): string {
  return RustModule.WasmScope(Module => Module.WalletV4.Address.from_hex(hex).to_bech32());
}
