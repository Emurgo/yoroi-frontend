// @flow

import type { DeviceEvent, KnownDevice } from 'trezor-connect/lib/types/trezor/device';
import type { UiEvent } from 'trezor-connect/lib/types/events';
import type {
  API
} from 'trezor-connect/lib/types/api';
import type {
  CardanoAddress,
  CardanoPublicKey,
  CardanoSignedTxData,
  CardanoGetPublicKey,
  CardanoAddressParameters,
  CardanoGetAddress,
  CardanoSignedTxWitness,
} from 'trezor-connect/lib/types/networks/cardano';
import type { Success, } from 'trezor-connect/lib/types/params';
import { ADDRESS_TYPE, CERTIFICATE_TYPE } from './lib/constants/cardano';
import {
  bip32StringToPath, toDerivationPathString,
} from '../../app/api/common/lib/crypto/keys/path';
import {
  WalletTypePurpose,
  ChainDerivations,
} from '../../app/config/numbersConfig';
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import {
  generateWalletRootKey,
} from '../../app/api/ada/lib/cardanoCrypto/cryptoWallet';
import { testWallets } from '../mock-chain/TestWallets';
import { IncorrectDeviceError } from '../../app/domain/ExternalDeviceCommon';

const UI_EVENT: 'UI_EVENT' = 'UI_EVENT';
const DEVICE_EVENT: 'DEVICE_EVENT' = 'DEVICE_EVENT';

type WalletInfo = {|
  rootKey: RustModule.WalletV4.Bip32PrivateKey;
  deviceId: string,
  version: {|
    major_version: number,
    minor_version: number,
    patch_version: number,
  |},
|};

const CardanoTxSigningMode = Object.freeze({
  ORDINARY_TRANSACTION: 'ordinary_transaction',
  POOL_REGISTRATION_AS_OWNER: 'pool_registration_as_owner',
  MULTISIG_TRANSACTION: 'multisig_transaction',
});
const mockVersion = {
  major_version: 2,
  minor_version: 3,
  patch_version: 0,
};
async function genWalletInfo(deviceId: string): Promise<WalletInfo> {
  const wallets = Object.keys(testWallets).map(walletName => testWallets[walletName]);
  for (const wallet of wallets) {
    if (wallet.deviceId === deviceId) {
      const rootKey = generateWalletRootKey(wallet.mnemonic);
      return {
        rootKey,
        deviceId,
        version: mockVersion,
      };
    }
  }
  throw new Error(`Unknown test deviceId ${deviceId}`);
}

function derivePath(
  rootKey: RustModule.WalletV4.Bip32PrivateKey,
  path: Array<number>
): RustModule.WalletV4.Bip32PrivateKey {
  let finalKey = rootKey;
  for (const index of path) {
    finalKey = finalKey.derive(index);
  }
  return finalKey;
}

function toPath(path: string | Array<number>): Array<number> {
  return typeof path === 'string'
    ? bip32StringToPath(path)
    : path;
}

function deriveAddress(
  rootKey: RustModule.WalletV4.Bip32PrivateKey,
  request: CardanoGetAddress,
): RustModule.WalletV4.Address {
  if (request.addressParameters.path == null) {
    throw new Error('unexpected address parameter');
  }
  const spendingKey = derivePath(rootKey, toPath(request.addressParameters.path));

  if (request.addressParameters.addressType === ADDRESS_TYPE.Byron) {
    return RustModule.WalletV4.ByronAddress.icarus_from_key(
      spendingKey.to_public(),
      request.protocolMagic
    ).to_address();
  }
  if (request.addressParameters.addressType === ADDRESS_TYPE.Enterprise) {
    return RustModule.WalletV4.EnterpriseAddress.new(
      request.networkId,
      RustModule.WalletV4.StakeCredential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
    ).to_address();
  }
  if (request.addressParameters.addressType === ADDRESS_TYPE.Pointer) {
    if (request.addressParameters.certificatePointer == null) {
      throw new Error(`Missing pointer information`);
    }
    const pointer = RustModule.WalletV4.Pointer.new(
      request.addressParameters.certificatePointer.blockIndex,
      request.addressParameters.certificatePointer.txIndex,
      request.addressParameters.certificatePointer.certificateIndex
    );
    return RustModule.WalletV4.PointerAddress.new(
      request.networkId,
      RustModule.WalletV4.StakeCredential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
      pointer,
    ).to_address();
  }
  if (request.addressParameters.addressType === ADDRESS_TYPE.Reward) {
    return RustModule.WalletV4.RewardAddress.new(
      request.networkId,
      RustModule.WalletV4.StakeCredential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
    ).to_address();
  }
  if (request.addressParameters.addressType === ADDRESS_TYPE.Base) {
    let stakingKeyHash;
    if (request.addressParameters.stakingKeyHash != null) {
      stakingKeyHash = RustModule.WalletV4.Ed25519KeyHash.from_bytes(
        Buffer.from(request.addressParameters.stakingKeyHash, 'hex')
      );
    }
    if (request.addressParameters.stakingPath != null) {
      stakingKeyHash = derivePath(
        rootKey,
        toPath(request.addressParameters.stakingPath)
      ).to_raw_key().to_public().hash();
    }
    if (stakingKeyHash == null) {
      throw new Error(`Missing staking key information`);
    }
    return RustModule.WalletV4.BaseAddress.new(
      request.networkId,
      RustModule.WalletV4.StakeCredential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
      RustModule.WalletV4.StakeCredential.from_keyhash(stakingKeyHash),
    ).to_address();
  }
  throw new Error(`Unrecognized address type ${JSON.stringify(request)}`);
}

class MockTrezorConnect {

  static deviceEventListeners: Array<DeviceEvent => void> = [];
  static uiEventListeners: Array<UiEvent => void> = [];

  static selectedWallet: void | WalletInfo;

  checkDeviceId: ?string => void = (deviceId) => {
    if (deviceId == null) return;

    if (MockTrezorConnect.selectedWallet == null) {
      throw new Error(`No mock Trezor wallet selected`);
    }
    const selectedWallet = MockTrezorConnect.selectedWallet;

    if (selectedWallet.deviceId !== deviceId) {
      throw new IncorrectDeviceError({
        expectedDeviceId: deviceId,
        responseDeviceId: selectedWallet.deviceId,
      });
    }
  }

  static setSelectedWallet: string => Promise<void> = async (deviceId) => {
    MockTrezorConnect.selectedWallet = await genWalletInfo(deviceId);
  };

  static cardanoGetAddress: $PropertyType<API, 'cardanoGetAddress'> = async (params) => {
    MockTrezorConnect.mockConnectDevice();

    const genPayload = (request: CardanoGetAddress): CardanoAddress => {
      // this.checkSerial;
      if (MockTrezorConnect.selectedWallet == null) {
        throw new Error(`No mock Trezor wallet selected`);
      }
      const selectedWallet = MockTrezorConnect.selectedWallet;
      const address = deriveAddress(selectedWallet.rootKey, request);

      if (request.addressParameters.path == null) {
        throw new Error('unexpected address parameter');
      }
      const arrayPath = toPath(request.addressParameters.path);
      const serializedPath = typeof request.addressParameters.path === 'string'
        ? request.addressParameters.path
        : toDerivationPathString(arrayPath);

      const serializedStakingPath = request.addressParameters.stakingPath != null
        ? toDerivationPathString(toPath(request.addressParameters.stakingPath))
        : (() => {
          const copy = [...arrayPath];
          copy[3] = ChainDerivations.CHIMERIC_ACCOUNT;
          return toDerivationPathString(copy);
        })();

      const addressStr = request.addressParameters.addressType === ADDRESS_TYPE.Byron
        ? RustModule.WalletV4.ByronAddress.from_address(address)?.to_base58()
        : address.to_bech32();
      if (addressStr == null) throw new Error(`Address type mismatch ${JSON.stringify(request)}`);

      return {
        addressParameters: request.addressParameters,
        protocolMagic: request.protocolMagic,
        networkId: request.networkId,
        serializedStakingPath,
        serializedPath,
        address: addressStr,
      };
    };

    const result = ({
      success: (true: true),
      id: 0,
      payload: params.bundle
        ? params.bundle.map(entry => genPayload(entry))
        : genPayload(params),
    }: Success<Array<CardanoAddress> | CardanoAddress>);
    return (result: Success<any>);
  };

  static cardanoGetPublicKey: $PropertyType<API, 'cardanoGetPublicKey'> = async (params) => {
    MockTrezorConnect.mockConnectDevice();

    const genPayload = (key: CardanoGetPublicKey): CardanoPublicKey => {
      // this.checkSerial;
      if (MockTrezorConnect.selectedWallet == null) {
        throw new Error(`No mock Trezor wallet selected`);
      }
      const selectedWallet = MockTrezorConnect.selectedWallet;

      const path = toPath(key.path);
      const serializedPath = typeof key.path === 'string'
        ? key.path
        : toDerivationPathString(key.path);

      const accountKey = derivePath(selectedWallet.rootKey, path).to_public();

      return {
        path,
        serializedPath,
        publicKey: Buffer.from(accountKey.as_bytes()).toString('hex'),
        node: {
          depth: path.length,
          fingerprint: 3586099367,
          child_num: path[path.length - 1],
          chain_code: Buffer.from(accountKey.chaincode()).toString('hex'),
          public_key: Buffer.from(accountKey.as_bytes()).toString('hex'),
        },
      };
    };
    const result = ({
      success: (true: true),
      id: 0,
      payload: params.bundle
        ? params.bundle.map(entry => genPayload(entry))
        : genPayload(params),
    }: Success<Array<CardanoPublicKey> | CardanoPublicKey>);
    return (result: Success<any>);
  };

  static cardanoSignTransaction: $PropertyType<API, 'cardanoSignTransaction'> = async (request) => {
    MockTrezorConnect.mockConnectDevice();

    if (MockTrezorConnect.selectedWallet == null) {
      throw new Error(`No mock Trezor wallet selected`);
    }
    const selectedWallet = MockTrezorConnect.selectedWallet;

    const witGens: Array<RustModule.WalletV4.TransactionHash => void> = [];

    const seenBootstrapKeys = new Set<string>();
    const seenVkeyWits = new Set<string>();
    const witnessesToReturn: Array<CardanoSignedTxWitness> = [];

    const addWitness: (
      Array<number>,
      RustModule.WalletV4.Bip32PrivateKey,
      RustModule.WalletV4.TransactionHash
    ) => void = (path, key, hash) => {
      const pubKey = Buffer.from(key.to_raw_key().to_public().as_bytes()).toString('hex');
      const vkey = RustModule.WalletV4.Vkey.new(key.to_raw_key().to_public());
      const sig = key.to_raw_key().sign(Buffer.from(hash.to_bytes()));
      if (path[0] === WalletTypePurpose.BIP44) {
        const byronAddress = RustModule.WalletV4.ByronAddress.icarus_from_key(
          key.to_public(),
          request.protocolMagic
        );
        const bootstrapWit = RustModule.WalletV4.BootstrapWitness.new(
          vkey,
          sig,
          key.chaincode(),
          byronAddress.attributes(),
        );
        const asString = Buffer.from(bootstrapWit.to_bytes()).toString('hex');
        if (seenBootstrapKeys.has(asString)) {
          return;
        }
        seenBootstrapKeys.add(asString);
        witnessesToReturn.push({
          type: 0,
          pubKey,
          signature: Buffer.from(sig.to_bytes()).toString('hex'),
          chainCode: Buffer.from(key.chaincode()).toString('hex'),
        });
        return;
      }
      const witness = RustModule.WalletV4.Vkeywitness.new(
        vkey,
        sig,
      );
      const witAsStr = Buffer.from(witness.to_bytes()).toString('hex');
      if (seenVkeyWits.has(witAsStr)) {
        return;
      }
      seenVkeyWits.add(witAsStr);
      witnessesToReturn.push({
        type: 1,
        pubKey,
        signature: Buffer.from(sig.to_bytes()).toString('hex'),
      });
    };

    const inputs = RustModule.WalletV4.TransactionInputs.new();
    for (const input of request.inputs) {
      const { path } = input;
      if (path == null) continue;
      inputs.add(
        RustModule.WalletV4.TransactionInput.new(
          RustModule.WalletV4.TransactionHash.from_bytes(Buffer.from(input.prev_hash, 'hex')),
          input.prev_index
        )
      );
      const spendingKey = derivePath(selectedWallet.rootKey, toPath(path));
      witGens.push((hash) => addWitness(toPath(path), spendingKey, hash));
    }
    const outputs = RustModule.WalletV4.TransactionOutputs.new();
    for (const output of request.outputs) {
      let address;
      if (output.addressParameters != null) {
        const coercedParams = ((output.addressParameters: any): CardanoAddressParameters);
        address = deriveAddress(
          selectedWallet.rootKey,
          {
            addressParameters: coercedParams,
            protocolMagic: request.protocolMagic,
            networkId: request.networkId,
          }
        );
      }
      if (output.address != null) {
        const coercedAddress = ((output.address: any): string);
        address = RustModule.WalletV4.ByronAddress.is_valid(coercedAddress)
          ? RustModule.WalletV4.ByronAddress.from_base58(coercedAddress).to_address()
          : RustModule.WalletV4.Address.from_bech32(coercedAddress);
      }
      if (address == null) throw new Error(`Missing output address information ${JSON.stringify(output)}`);
      outputs.add(
        RustModule.WalletV4.TransactionOutput.new(
          address,
          RustModule.WalletV4.Value.new(RustModule.WalletV4.BigNum.from_str(output.amount))
        )
      );
    }

    const body = RustModule.WalletV4.TransactionBody.new(
      inputs,
      outputs,
      RustModule.WalletV4.BigNum.from_str(request.fee),
      request.ttl == null ? undefined : Number.parseInt(request.ttl, 10),
    );
    if (request.certificates != null && request.certificates.length > 0) {
      const certRequest = request.certificates;
      const certs = RustModule.WalletV4.Certificates.new();
      for (const cert of certRequest) {
        const { path } = cert;
        if (path == null) continue;
        const stakingKey = derivePath(selectedWallet.rootKey, toPath(path));
        const stakeCredential = RustModule.WalletV4.StakeCredential.from_keyhash(
          stakingKey.to_public().to_raw_key().hash()
        );
        if (cert.type === CERTIFICATE_TYPE.StakeRegistration) {
          certs.add(RustModule.WalletV4.Certificate.new_stake_registration(
            RustModule.WalletV4.StakeRegistration.new(stakeCredential)
          ));
        }
        if (cert.type === CERTIFICATE_TYPE.StakeDeregistration) {
          witGens.push((hash) => addWitness(toPath(path), stakingKey, hash));
          certs.add(RustModule.WalletV4.Certificate.new_stake_deregistration(
            RustModule.WalletV4.StakeDeregistration.new(stakeCredential)
          ));
        }
        if (cert.type === CERTIFICATE_TYPE.StakeDelegation) {
          witGens.push((hash) => addWitness(toPath(path), stakingKey, hash));

          if (cert.pool == null) throw new Error('Missing pool key hash');
          certs.add(RustModule.WalletV4.Certificate.new_stake_delegation(
            RustModule.WalletV4.StakeDelegation.new(
              stakeCredential,
              RustModule.WalletV4.Ed25519KeyHash.from_bytes(Buffer.from(cert.pool, 'hex'))
            )
          ));
        }
      }
      body.set_certs(certs);
    }

    const auxDataHash = request.auxiliaryData?.hash;
    if (auxDataHash != null) {
      body.set_auxiliary_data_hash(
        RustModule.WalletV4.AuxiliaryDataHash.from_bytes(
          Buffer.from(auxDataHash, 'hex')
        )
      );
    }
    if (request.auxiliaryData?.catalystRegistrationParameters) {
      throw new Error('not implemented');
    }
    if (request.withdrawals != null && request.withdrawals.length > 0) {
      const withdrawalRequest = request.withdrawals;
      const withdrawals = RustModule.WalletV4.Withdrawals.new();
      for (const withdrawal of withdrawalRequest) {
        if (withdrawal.path == null) {
          throw new Error('unexpected withdrawal parameter');
        }
        const arrayPath = toPath(withdrawal.path);
        const stakingKey = derivePath(selectedWallet.rootKey, arrayPath);
        witGens.push((hash) => addWitness(arrayPath, stakingKey, hash));

        const rewardAddress = RustModule.WalletV4.RewardAddress.new(
          request.networkId,
          RustModule.WalletV4.StakeCredential.from_keyhash(
            stakingKey.to_public().to_raw_key().hash()
          )
        );
        withdrawals.insert(
          rewardAddress,
          RustModule.WalletV4.BigNum.from_str(withdrawal.amount)
        );
      }
      body.set_withdrawals(withdrawals);
    }

    const txBodyHash = RustModule.WalletV4.hash_transaction(body);
    for (const witGen of witGens) {
      witGen(txBodyHash);
    }

    // TODO: handle scripts

    return ({
      success: true,
      id: 0,
      payload: {
        hash: Buffer.from(txBodyHash.to_bytes()).toString('hex'),
        witnesses: witnessesToReturn,
      },
    }: Success<CardanoSignedTxData>) ;
  };

  static manifest: $PropertyType<API, 'manifest'> = (_data) => {
  }

  static init: $PropertyType<API, 'init'> = async (_settings) => {
  }

  static dispose: $PropertyType<API, 'dispose'> = (): void => {
  }

  static on: $PropertyType<API, 'on'> = (type, fn: any): void => {
    if (type === DEVICE_EVENT) {
      this.deviceEventListeners.push(fn);
    }
    if (type === UI_EVENT) {
      this.uiEventListeners.push(fn);
    }
  }

  static off: $PropertyType<API, 'off'> = (type, fn: any): void => {
    if (type === DEVICE_EVENT) {
      this.deviceEventListeners = this.deviceEventListeners.filter(event => event !== fn);
    }
    if (type === UI_EVENT) {
      this.uiEventListeners = this.uiEventListeners.filter(event => event !== fn);
    }
  }

  static mockConnectDevice: void => void = () => {
    if (MockTrezorConnect.selectedWallet == null) {
      throw new Error(`No mock Trezor wallet selected`);
    }
    const selectedWallet = MockTrezorConnect.selectedWallet;

    this.deviceEventListeners.forEach(func => func({
      event: DEVICE_EVENT,
      type: 'device-changed',
      payload: ({
        type: 'acquired',
        id: null,
        path: '5',
        label: 'My Trezor',
        state: '6dac00bf532594194beaf682e5fc5659ffcf131466455cd9fb4e964a3a47c983',
        status: 'available',
        mode: 'normal',
        firmware: 'valid',
        firmwareRelease: undefined,
        unavailableCapabilities: {},
        features: {
          vendor: 'trezor.io',
          ...selectedWallet.version,
          bootloader_mode: (null: any),
          capabilities: [],
          device_id: selectedWallet.deviceId,
          pin_protection: false,
          passphrase_protection: false,
          language: 'en-US',
          label: (null: any),
          initialized: true,
          revision: '306237613834343966',
          bootloader_hash: (null: any),
          imported: (null: any),
          pin_cached: false,
          passphrase_cached: (null: any),
          firmware_present: (null: any),
          needs_backup: false,
          flags: 0,
          model: 'T',
          fw_major: (null: any),
          fw_minor: (null: any),
          fw_patch: (null: any),
          fw_vendor: (null: any),
          fw_vendor_keys: (null: any),
          unfinished_backup: false,
          no_backup: false,
          recovery_mode: false,
          backup_type: null,
          sd_card_present: false,
          sd_protection: false,
          wipe_code_protection: false,
          session_id: null,
          passphrase_always_on_device: false,
          safety_checks: null,
          auto_lock_delay_ms: 0,
          display_rotation: 0,
          experimental_features: false,
          unlocked: false,
        }
      }: KnownDevice)
    }));
  }
}

export default MockTrezorConnect;

export { UI_EVENT, DEVICE_EVENT, CardanoTxSigningMode, };
