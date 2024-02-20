// @flow

import type { CoreAddressT } from '../database/primitives/enums';
import { CoreAddressTypes } from '../database/primitives/enums';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import type { NetworkRow } from '../database/primitives/tables';
import { isCardanoHaskell } from '../database/prepackaged/networks';
import { defineMessages } from 'react-intl';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { bech32 as bech32Module } from 'bech32';

export function tryAddressToKind(
  address: string,
  parseAs: 'bech32' | 'bytes',
  network: $ReadOnly<NetworkRow>
): void | CoreAddressT {
  try {
    return addressToKind(address, parseAs, network);
  } catch (_e) {
    return undefined;
  }
}

export function addressToKind(
  address: string,
  parseAs: 'bech32' | 'bytes',
  network: $ReadOnly<NetworkRow>
): CoreAddressT {
  try {
    return RustModule.WasmScope(Scope => {
      if (isCardanoHaskell(network)) {
        // Need to try parsing as a legacy address first
        // Since parsing as bech32 directly may give a wrong result if the address contains a 1
        if (Scope.WalletV4.ByronAddress.is_valid(address)) {
          return CoreAddressTypes.CARDANO_LEGACY;
        }
        const wasmAddr =
          parseAs === 'bytes'
            ? Scope.WalletV4.Address.from_bytes(Buffer.from(address, 'hex'))
            : Scope.WalletV4.Address.from_bech32(address);
        {
          const byronAddr = Scope.WalletV4.ByronAddress.from_address(wasmAddr);
          if (byronAddr) return CoreAddressTypes.CARDANO_LEGACY;
        }
        {
          const baseAddr = Scope.WalletV4.BaseAddress.from_address(wasmAddr);
          if (baseAddr) return CoreAddressTypes.CARDANO_BASE;
        }
        {
          const ptrAddr = Scope.WalletV4.PointerAddress.from_address(wasmAddr);
          if (ptrAddr) return CoreAddressTypes.CARDANO_PTR;
        }
        {
          const enterpriseAddr = Scope.WalletV4.EnterpriseAddress.from_address(wasmAddr);
          if (enterpriseAddr) return CoreAddressTypes.CARDANO_ENTERPRISE;
        }
        {
          const rewardAddr = Scope.WalletV4.RewardAddress.from_address(wasmAddr);
          if (rewardAddr) return CoreAddressTypes.CARDANO_REWARD;
        }
        throw new Error(`${nameof(addressToKind)} unknown address type`);
      }
      throw new Error(`${nameof(addressToKind)} not implemented for network ${network.NetworkId}`);
    });
  } catch (e1) {
    throw new Error(`${nameof(addressToKind)} failed to parse address type ${e1} ${address}`);
  }
}

// <TODO:FIX> THIS IS TERRIBLE, messages in api and the return type is awful
export function isValidReceiveAddress(
  bech32: string,
  network: $ReadOnly<NetworkRow>
): true | [false, $Exact<$npm$ReactIntl$MessageDescriptor>, number] {
  const messages = defineMessages({
    invalidAddress: {
      id: 'wallet.send.form.errors.invalidAddress',
      defaultMessage: '!!!Incorrect address format',
    },
    cannotSendToLegacy: {
      id: 'wallet.send.form.cannotSendToLegacy',
      defaultMessage:
        '!!!Unable to send funds to legacy addresses (any address created before July 29th, 2020).',
    },
    cannotSendToReward: {
      id: 'wallet.send.form.cannotSendToReward',
      defaultMessage: '!!!Unable to send funds to a reward account.',
    },
    cannotSendToP2SH: {
      id: 'wallet.send.form.cannotSendToP2SH',
      defaultMessage: '!!!Unable to send funds to pay-to-script-hash addresses.',
    },
    wrongNetwork: {
      id: 'global.wrongNetwork.address',
      defaultMessage: '!!!This address is on a different network. Please retype.',
    },
  });

  const kind = tryAddressToKind(bech32, 'bech32', network);
  if (kind == null) {
    return [false, messages.invalidAddress, 1];
  }
  if (isCardanoHaskell(network)) {
    if (kind === CoreAddressTypes.CARDANO_REWARD) {
      return [false, messages.cannotSendToReward, 2];
    }
    if (isCardanoHaskellAddress(kind)) {
      const addr = normalizeToAddress(bech32);
      if (addr == null) throw new Error('Should never happen');

      const expectedNetworkId = Number.parseInt(network.BaseConfig[0].ChainNetworkId, 10);
      if (addr.network_id() !== expectedNetworkId) {
        return [false, messages.wrongNetwork, 3];
      }
      return true;
    }
    return [false, messages.invalidAddress, 1];
  }

  throw new Error(
    `${nameof(isValidReceiveAddress)} Unsupported network ${JSON.stringify(network)}`
  );
}

export function byronAddrToHex(base58Addr: string): string {
  return Buffer.from(RustModule.WalletV4.ByronAddress.from_base58(base58Addr).to_bytes()).toString(
    'hex'
  );
}

export function normalizeToBase58(addr: string): void | string {
  // in Shelley, addresses can be base16, bech32 or base58
  // this function normalizes everything to base58

  // 1) If already base58, simply return
  if (RustModule.WalletV4.ByronAddress.is_valid(addr)) {
    return addr;
  }

  // 2) Try converting from base16
  try {
    const wasmAddr = RustModule.WalletV4.Address.from_bytes(Buffer.from(addr, 'hex'));
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
    if (byronAddr) return byronAddr.to_base58();
    return undefined; // wrong address kind
  } catch (_e) {} // eslint-disable-line no-empty

  // 3) Try converting from base32
  try {
    const wasmAddr = RustModule.WalletV4.Address.from_bech32(addr);
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
    if (byronAddr) return byronAddr.to_base58();
    return undefined; // wrong address kind
  } catch (_e) {} // eslint-disable-line no-empty

  return undefined;
}

// this implementation was copied from the convert function of the bech32 package.
const convertBase32ToHex = (data: any[]) => {
  const encoded = bech32Module.fromWords(data);
  const hex = Buffer.from(encoded).toString('hex');

  return hex;
};

/* eslint-disable */
const bigIntToBase58 = n => {
  const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  const o = [];
  let x = n;
  while (x > 0) {
    // $FlowFixMe[cannot-resolve-name]
    const divisionResult = x / BigInt(58);
    const remainder = x % BigInt(58);
    x = divisionResult;

    o.push(base58Alphabet[remainder]);
  }

  return o.reverse().join('');
};
/* eslint-enable */

// length of the address excluding prefixes and other info added in the pointer addresses
const baseAddrLength = 28;
const hexAddressConfig: any = [
  {
    // base
    validate: (addr: string) => Buffer.from(addr, 'hex').length === 1 + baseAddrLength * 2,
    header: /^[0-3]/,
  },
  {
    // pointer
    validate: (addr: string) => Buffer.from(addr, 'hex').length >= 1 + baseAddrLength + 3,
    header: /^[4-5]/,
  },
  {
    // enterprise
    validate: (addr: string) => Buffer.from(addr, 'hex').length === 1 + baseAddrLength,
    header: /^[6-7]/,
  },
  {
    // byron
    parse: (addr: string) => {
      /* eslint-disable */
      // $FlowFixMe[cannot-resolve-name]
      const base58 = bigIntToBase58(BigInt(`0x${addr}`));
      if (RustModule.WalletV4.ByronAddress.is_valid(base58)) {
        return RustModule.WalletV4.ByronAddress.from_base58(base58).to_address();
      }
      /* eslint-enable */
    },
    header: /^[8]/,
  },
  {
    // reward
    validate: (addr: string) => Buffer.from(addr, 'hex').length === 1 + baseAddrLength,
    header: /^[e-f]|[E-F]/,
  },
];

export function normalizeToAddress(addr: string): void | RustModule.WalletV4.Address {
  // in Shelley, addresses can be base16, bech32 or base58
  // this function, we try parsing in all encodings possible

  // 1) If RustModule can validate addr is a Byron address, simply parse from base58
  if (RustModule.WalletV4.ByronAddress.is_valid(addr)) {
    return RustModule.WalletV4.ByronAddress.from_base58(addr).to_address();
  }

  const parseHexAddress = (hexAddr: string) => {
    // 2.1) check if addr starts with any of the supported headers
    const config = hexAddressConfig.find(c => c.header.test(hexAddr));
    if (config) {
      // 2.2) if there's a parse function defined in the config, use it...
      if (config.parse) {
        return config.parse(hexAddr);
      }

      // 2.3) ...otherwise, validate the address with the validation function defined in the config
      if (config.validate(hexAddr)) {
        try {
          return RustModule.WalletV4.Address.from_bytes(Buffer.from(hexAddr, 'hex'));
        } catch {} // eslint-disable-line no-empty
      }
    }

    // if we got to this point, addr is a hex which cannot be parsed into an address
    return undefined;
  };

  // 2) If addr is in hex format...
  const isHex = /^[a-fA-F0-9]+$/;
  if (isHex.test(addr)) {
    return parseHexAddress(addr);
  }

  // 3) Try decoding bech32...
  const bech32Decoded = bech32Module.decodeUnsafe(addr, addr.length);
  if (bech32Decoded) {
    // 3.1) if successfull, convert the decoded bech32 to base16 and try parsing the hex
    const hex = convertBase32ToHex(bech32Decoded.words);
    return parseHexAddress(hex);
  }

  return undefined;
}

export function toEnterprise(address: string): void | RustModule.WalletV4.EnterpriseAddress {
  if (RustModule.WalletV4.ByronAddress.is_valid(address)) {
    return undefined;
  }
  const wasmAddr = RustModule.WalletV4.Address.from_bytes(Buffer.from(address, 'hex'));
  const spendingKey = getCardanoSpendingKeyHash(wasmAddr);
  if (spendingKey == null) return undefined;

  const singleAddr = RustModule.WalletV4.EnterpriseAddress.new(
    wasmAddr.network_id(),
    RustModule.WalletV4.Credential.from_keyhash(spendingKey)
  );
  return singleAddr;
}

export function isCardanoHaskellAddress(kind: CoreAddressT): boolean {
  if (kind === CoreAddressTypes.CARDANO_LEGACY) return true;
  if (kind === CoreAddressTypes.CARDANO_BASE) return true;
  if (kind === CoreAddressTypes.CARDANO_PTR) return true;
  if (kind === CoreAddressTypes.CARDANO_ENTERPRISE) return true;
  if (kind === CoreAddressTypes.CARDANO_REWARD) return true;
  return false;
}

export function getCardanoSpendingKeyHash(
  addr: RustModule.WalletV4.Address
): // null -> legacy address (no key hash)
// undefined -> script hash instead of key hash
RustModule.WalletV4.Ed25519KeyHash | null | void {
  {
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(addr);
    if (byronAddr) return null;
  }
  {
    const baseAddr = RustModule.WalletV4.BaseAddress.from_address(addr);
    if (baseAddr) return baseAddr.payment_cred().to_keyhash();
  }
  {
    const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(addr);
    if (ptrAddr) return ptrAddr.payment_cred().to_keyhash();
  }
  {
    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(addr);
    if (enterpriseAddr) return enterpriseAddr.payment_cred().to_keyhash();
  }
  {
    const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(addr);
    if (rewardAddr) return rewardAddr.payment_cred().to_keyhash();
  }
  throw new Error(`${nameof(getCardanoSpendingKeyHash)} unknown address type`);
}

export function addressToDisplayString(address: string, network: $ReadOnly<NetworkRow>): string {
  try {
    if (isCardanoHaskell(network)) {
      // Need to try parsing as a legacy address first
      // Since parsing as bech32 directly may give a wrong result if the address contains a 1
      if (RustModule.WalletV4.ByronAddress.is_valid(address)) {
        return address;
      }
      const wasmAddr = RustModule.WalletV4.Address.from_bytes(Buffer.from(address, 'hex'));
      const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
      if (byronAddr == null) {
        return wasmAddr.to_bech32();
      }
      return byronAddr.to_base58();
    }
    throw new Error(
      `${nameof(addressToDisplayString)} not implemented for network ${network.NetworkId}`
    );
  } catch (_e2) {
    throw new Error(`${nameof(addressToDisplayString)} failed to parse address type ` + address);
  }
}

// need to format shelley addresses as base16 but only legacy addresses as base58
export function toHexOrBase58(address: RustModule.WalletV4.Address): string {
  const asByron = RustModule.WalletV4.ByronAddress.from_address(address);
  if (asByron == null) {
    return Buffer.from(address.to_bytes()).toString('hex');
  }
  return asByron.to_base58();
}

export function getAddressPayload(address: string, network: $ReadOnly<NetworkRow>): string {
  try {
    if (isCardanoHaskell(network)) {
      // Need to try parsing as a legacy address first
      // Since parsing as bech32 directly may give a wrong result if the address contains a 1
      if (RustModule.WalletV4.ByronAddress.is_valid(address)) {
        return address;
      }
      const wasmAddr = RustModule.WalletV4.Address.from_bech32(address);
      const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
      if (byronAddr == null) {
        return Buffer.from(wasmAddr.to_bytes()).toString('hex');
      }
      return byronAddr.to_base58();
    }
    throw new Error(
      `${nameof(getAddressPayload)} not implemented for network ${network.NetworkId}`
    );
  } catch (_e2) {
    throw new Error(`${nameof(getAddressPayload)} failed to parse address type ` + address);
  }
}

export function unwrapStakingKey(stakingAddress: string): RustModule.WalletV4.Credential {
  const accountAddress = RustModule.WalletV4.RewardAddress.from_address(
    RustModule.WalletV4.Address.from_bytes(Buffer.from(stakingAddress, 'hex'))
  );
  if (accountAddress == null) {
    throw new Error(`${nameof(unwrapStakingKey)} staking key invalid`);
  }
  const stakingKey = accountAddress.payment_cred();

  return stakingKey;
}
