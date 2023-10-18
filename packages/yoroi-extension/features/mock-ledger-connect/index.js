// @flow

import type {
  ExtendedPublicKeyResp,
} from '../../app/utils/hwConnectHandler';
import type {
  BIP32Path,
  DeriveAddressRequest,
  GetExtendedPublicKeyRequest,
  GetExtendedPublicKeyResponse,
  GetExtendedPublicKeysRequest,
  GetExtendedPublicKeysResponse,
  GetVersionResponse,
  GetSerialResponse,
  DeriveAddressResponse,
  SignTransactionRequest,
  SignTransactionResponse,
  ShowAddressRequest,
  Witness,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import {
  generateLedgerWalletRootKey,
} from '../../app/api/ada/lib/cardanoCrypto/cryptoWallet';
import { testWallets } from '../mock-chain/TestWallets';
import { IncorrectDeviceError } from '../../app/domain/ExternalDeviceCommon';
import {
  AddressType,
  CertificateType,
  TxOutputDestinationType,
  TxAuxiliaryDataType,
  StakeCredentialParamsType,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

/*
Mocking a ledger device is not possible anymore after this update https://github.com/Emurgo/yoroi-frontend/pull/2896
 */

type WalletInfo = {|
  rootKey: RustModule.WalletV4.Bip32PrivateKey;
  serial: GetSerialResponse,
  version: GetVersionResponse,
|};
const mockDeviceVersion = {
  major: 2,
  minor: 2,
  patch: 0,
  flags: {
    isDebug: false,
  }
};

async function genWalletInfo(serial: string): Promise<WalletInfo> {
  const wallets = Object.keys(testWallets).map(walletName => testWallets[walletName]);
  for (const wallet of wallets) {
    if (wallet.deviceId === serial) {
      const rootKey = generateLedgerWalletRootKey(wallet.mnemonic);
      return {
        rootKey,
        serial: { serialHex: serial },
        version: {
          version: mockDeviceVersion,
          compatibility: {
            isCompatible: true,
            recommendedVersion: null,
            supportsMary: true,
            supportsCatalystRegistration: true,
            supportsZeroTtl: true,
            supportsMint: true,
            supportsNativeScriptHashDerivation: true,
            supportsPoolRegistrationAsOperator: true,
            supportsPoolRetirement: true,
            supportsMultisigTransaction: true,
            supportsAlonzo: false,
            supportsBabbage: false,
            supportsReqSignersInOrdinaryTx: false,
            supportsCIP36: false,
            supportsCIP36Vote: false,
          },
        },
      };
    }
  }
  throw new Error(`Unknown test serial ${serial}`);
}

function derivePath(
  rootKey: RustModule.WalletV4.Bip32PrivateKey,
  path: BIP32Path
): RustModule.WalletV4.Bip32PrivateKey {
  let finalKey = rootKey;
  for (const index of path) {
    finalKey = finalKey.derive(index);
  }
  return finalKey;
}

function deriveAddress(
  rootKey: RustModule.WalletV4.Bip32PrivateKey,
  request: {
    ...DeriveAddressRequest,
    ...,
  },
): RustModule.WalletV4.Address {
  let keyPath;
  if (request.address.type === AddressType.REWARD_KEY) {
    if (request.address.params.stakingPath) {
      keyPath = request.address.params.stakingPath;
    } else { // request.address.params.stakingScriptHash
      throw new Error('not implemented for this address type');
    }
  } else if (request.address.params.spendingPath) {
    keyPath = request.address.params.spendingPath;
  } else {
    throw new Error('not implemented for this address type');
  }

  const spendingKey = derivePath(rootKey, keyPath);

  if (request.address.type === AddressType.BYRON) {
    return RustModule.WalletV4.ByronAddress.icarus_from_key(
      spendingKey.to_public(),
      request.network.protocolMagic
    ).to_address();
  }
  if (request.address.type === AddressType.ENTERPRISE_KEY) {
    return RustModule.WalletV4.EnterpriseAddress.new(
      request.network.networkId,
      RustModule.WalletV4.Credential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
    ).to_address();
  }
  if (request.address.type === AddressType.POINTER_KEY) {
    const pointer = RustModule.WalletV4.Pointer.new(
      request.address.params.stakingBlockchainPointer.blockIndex,
      request.address.params.stakingBlockchainPointer.txIndex,
      request.address.params.stakingBlockchainPointer.certificateIndex
    );
    return RustModule.WalletV4.PointerAddress.new(
      request.network.networkId,
      RustModule.WalletV4.Credential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
      pointer,
    ).to_address();
  }
  if (request.address.type === AddressType.REWARD_KEY) {
    return RustModule.WalletV4.RewardAddress.new(
      request.network.networkId,
      RustModule.WalletV4.Credential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
    ).to_address();
  }
  if (request.address.type === AddressType.BASE_PAYMENT_KEY_STAKE_KEY) {
    let stakingKeyHash;
    if (request.address.params.stakingKeyHashHex != null) {
      stakingKeyHash = RustModule.WalletV4.Ed25519KeyHash.from_bytes(
        Buffer.from(request.address.params.stakingKeyHashHex, 'hex')
      );
    }
    if (request.address.params.stakingPath != null) {
      stakingKeyHash = derivePath(
        rootKey,
        request.address.params.stakingPath
      ).to_raw_key().to_public().hash();
    }
    if (stakingKeyHash == null) {
      throw new Error(`Missing staking key information`);
    }
    return RustModule.WalletV4.BaseAddress.new(
      request.network.networkId,
      RustModule.WalletV4.Credential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
      RustModule.WalletV4.Credential.from_keyhash(stakingKeyHash),
    ).to_address();
  }
  throw new Error(`Unrecognized address type ${JSON.stringify(request)}`);
}

class MockLedgerConnect {

  constructor(params: any) {
    // eslint-disable-next-line no-console
    console.log(`Ledger connection established with parameters ${JSON.stringify(params)}`);
  }

  static selectedWallet: void | WalletInfo;

  checkSerial: ?string => void = (serial) => {
    if (serial == null) return;

    if (MockLedgerConnect.selectedWallet == null) {
      throw new Error(`No mock Ledger wallet selected`);
    }
    const selectedWallet = MockLedgerConnect.selectedWallet;

    if (selectedWallet.serial.serialHex !== serial) {
      throw new IncorrectDeviceError({
        expectedDeviceId: serial,
        responseDeviceId: selectedWallet.serial.serialHex,
      });
    }
  }

  static setSelectedWallet: string => Promise<void> = async (serial) => {
    MockLedgerConnect.selectedWallet = await genWalletInfo(serial);
  }

  getExtendedPublicKey: {|
    serial: ?string,
    params: GetExtendedPublicKeyRequest,
  |} => Promise<ExtendedPublicKeyResp<GetExtendedPublicKeyResponse>> = async (request) => {
    this.checkSerial(request.serial);
    if (MockLedgerConnect.selectedWallet == null) {
      throw new Error(`No mock Ledger wallet selected`);
    }
    const selectedWallet = MockLedgerConnect.selectedWallet;

    const finalKey = derivePath(selectedWallet.rootKey, request.params.path);
    const responseKey = {
      publicKeyHex: Buffer.from(finalKey.to_raw_key().to_public().as_bytes()).toString('hex'),
      chainCodeHex: Buffer.from(finalKey.chaincode()).toString('hex'),
    };
    return {
      response: responseKey,
      deviceVersion: selectedWallet.version,
      deriveSerial: selectedWallet.serial,
    };
  }

  getExtendedPublicKeys: {|
    serial: ?string,
    params: GetExtendedPublicKeysRequest,
  |} => Promise<ExtendedPublicKeyResp<GetExtendedPublicKeysResponse>> = async (request) => {
    this.checkSerial(request.serial);
    if (MockLedgerConnect.selectedWallet == null) {
      throw new Error(`No mock Ledger wallet selected`);
    }
    const selectedWallet = MockLedgerConnect.selectedWallet;

    const responseKeys: GetExtendedPublicKeysResponse = request.params.paths.map(path => {
      const finalKey = derivePath(selectedWallet.rootKey, path);
      return {
        publicKeyHex: Buffer.from(finalKey.to_raw_key().to_public().as_bytes()).toString('hex'),
        chainCodeHex: Buffer.from(finalKey.chaincode()).toString('hex'),
      };
    });
    return {
      response: responseKeys,
      deviceVersion: selectedWallet.version,
      deriveSerial: selectedWallet.serial,
    };
  }

  signTransaction: {|
    serial: ?string,
    params: SignTransactionRequest,
  |} => Promise<SignTransactionResponse> = async (request) => {
    this.checkSerial(request.serial);

    if (MockLedgerConnect.selectedWallet == null) {
      throw new Error(`No mock Ledger wallet selected`);
    }
    const selectedWallet = MockLedgerConnect.selectedWallet;

    const keys: Array<{|
      witGen: RustModule.WalletV4.TransactionHash => RustModule.WalletV4.Ed25519Signature,
      path: BIP32Path
    |}> = [];

    const inputs = RustModule.WalletV4.TransactionInputs.new();
    for (const input of request.params.tx.inputs) {
      inputs.add(
        RustModule.WalletV4.TransactionInput.new(
          RustModule.WalletV4.TransactionHash.from_bytes(Buffer.from(input.txHashHex, 'hex')),
          input.outputIndex
        )
      );
      if (input.path == null) throw new Error(`${nameof(MockLedgerConnect)} no path for input`);
      const { path } = input;
      const spendingKey = derivePath(selectedWallet.rootKey, input.path);
      keys.push({
        witGen: (hash) => spendingKey.to_raw_key().sign(hash.to_bytes()),
        path,
      });
    }
    const outputs = RustModule.WalletV4.TransactionOutputs.new();
    for (const output of request.params.tx.outputs) {
      let address;
      if (output.destination.type === TxOutputDestinationType.DEVICE_OWNED) {
        address = deriveAddress(
          selectedWallet.rootKey,
          {
            network: request.params.tx.network,
            address: output.destination.params,
          }
        );
      }
      if (output.destination.type === TxOutputDestinationType.THIRD_PARTY) {
          address = RustModule.WalletV4.Address.from_bytes(Buffer.from(output.destination.params.addressHex, 'hex'));
        }
      if (address == null) throw new Error(`Missing output address information ${JSON.stringify(output)}`);

      const value = RustModule.WalletV4.Value.new(
        RustModule.WalletV4.BigNum.from_str(output.amount.toString())
      );
      const multiasset = RustModule.WalletV4.MultiAsset.new();
      for (const assetGroup of (output.tokenBundle ?? [])) {
        const scriptHash = RustModule.WalletV4.ScriptHash.from_bytes(Buffer.from(assetGroup.policyIdHex, 'hex'));

        const assets = RustModule.WalletV4.Assets.new();
        for (const token of assetGroup.tokens) {
          assets.insert(
            RustModule.WalletV4.AssetName.new(Buffer.from(token.assetNameHex, 'hex')),
            RustModule.WalletV4.BigNum.from_str(token.amount.toString())
          );
        }

        multiasset.insert(scriptHash, assets);
      }
      if (multiasset.len() > 0) {
        value.set_multiasset(multiasset);
      }
      outputs.add(
        RustModule.WalletV4.TransactionOutput.new(
          address,
          value
        )
      );
    }

    const body = RustModule.WalletV4.TransactionBody.new(
      inputs,
      outputs,
      RustModule.WalletV4.BigNum.from_str(request.params.tx.fee.toString()),
      request.params.tx.ttl == null
        ? undefined
        : Number.parseInt(request.params.tx.ttl.toString(), 10),
    );
    if (request.params.tx.certificates && request.params.tx.certificates.length > 0) {
      const certs = RustModule.WalletV4.Certificates.new();
      for (const cert of request.params.tx.certificates ?? []) {
        if (
          cert.type === CertificateType.STAKE_POOL_REGISTRATION ||
            cert.type === CertificateType.STAKE_POOL_RETIREMENT
        ) {
          // TODO
          continue;
        }
        if (cert.params.stakeCredential.type !== StakeCredentialParamsType.KEY_PATH) {
          throw new Error('unsupported stake credential type');
        }
        const { keyPath } = cert.params.stakeCredential;
        const stakingKey = derivePath(selectedWallet.rootKey, keyPath).to_raw_key();
        const stakeCredential = RustModule.WalletV4.Credential.from_keyhash(
          stakingKey.to_public().hash()
        );
        if (cert.type === CertificateType.STAKE_REGISTRATION) {
          certs.add(RustModule.WalletV4.Certificate.new_stake_registration(
            RustModule.WalletV4.StakeRegistration.new(stakeCredential)
          ));
        }
        if (cert.type === CertificateType.STAKE_DEREGISTRATION) {
          keys.push({
            witGen: (hash) => stakingKey.sign(hash.to_bytes()),
            path: keyPath,
          });
          certs.add(RustModule.WalletV4.Certificate.new_stake_deregistration(
            RustModule.WalletV4.StakeDeregistration.new(stakeCredential)
          ));
        }
        if (cert.type === CertificateType.STAKE_DELEGATION) {
          keys.push({
            witGen: (hash) => stakingKey.sign(hash.to_bytes()),
            path: keyPath,
          });

          if (cert.params.poolKeyHashHex == null) throw new Error('Missing pool key hash');
          certs.add(RustModule.WalletV4.Certificate.new_stake_delegation(
            RustModule.WalletV4.StakeDelegation.new(
              stakeCredential,
              RustModule.WalletV4.Ed25519KeyHash.from_bytes(Buffer.from(cert.params.poolKeyHashHex, 'hex'))
            )
          ));
        }
      }
      body.set_certs(certs);
    }
    if (request.params.tx.auxiliaryData != null) {
      if (
        request.params.tx.auxiliaryData.type ===
          TxAuxiliaryDataType.ARBITRARY_HASH
      ) {
        body.set_auxiliary_data_hash(RustModule.WalletV4.AuxiliaryDataHash.from_bytes(
          Buffer.from(request.params.tx.auxiliaryData.params.hashHex, 'hex')
        ));
      } else {
        throw new Error('mock Ledger does not support Catalyst registration tx');
      }
    }
    if (request.params.tx.validityIntervalStart != null) {
      body.set_validity_start_interval(
        Number.parseInt(request.params.tx.validityIntervalStart.toString(), 10)
      );
    }
    if (request.params.tx.withdrawals && request.params.tx.withdrawals.length > 0) {
      const withdrawals = RustModule.WalletV4.Withdrawals.new();
      for (const withdrawal of request.params.tx.withdrawals ?? []) {
        if (withdrawal.stakeCredential.type !== StakeCredentialParamsType.KEY_PATH) {
          throw new Error('unsupported withdrawal stake credential type');
        }
        const { keyPath } = withdrawal.stakeCredential;
        const stakingKey = derivePath(selectedWallet.rootKey, keyPath).to_raw_key();
        keys.push({
          witGen: (hash) => stakingKey.sign(hash.to_bytes()),
          path: keyPath,
        });

        const rewardAddress = RustModule.WalletV4.RewardAddress.new(
          request.params.tx.network.networkId,
          RustModule.WalletV4.Credential.from_keyhash(
            stakingKey.to_public().hash()
          )
        );
        withdrawals.insert(
          rewardAddress,
          RustModule.WalletV4.BigNum.from_str(withdrawal.amount.toString())
        );
      }
      body.set_withdrawals(withdrawals);
    }

    const txBodyHash = RustModule.WalletV4.hash_transaction(body);
    const seenWitnesses = new Set<string>();

    const witnesses: Array<Witness> = [];
    for (const key of keys) {
      const witnessSignatureHex = Buffer.from(key.witGen(txBodyHash).to_bytes()).toString('hex');
      if (seenWitnesses.has(witnessSignatureHex)) {
        continue;
      }
      seenWitnesses.add(witnessSignatureHex);

      witnesses.push({
        path: key.path,
        witnessSignatureHex,
      });
    }
    return {
      txHashHex: Buffer.from(txBodyHash.to_bytes()).toString('hex'),
      witnesses,
      auxiliaryDataSupplement: null,
    };
  }

  showAddress: {|
    serial: ?string,
    params: {|
      ...ShowAddressRequest,
      expectedAddr: string,
    |},
  |} => Promise<void> = async (request) => {
    this.checkSerial(request.serial);

    if (MockLedgerConnect.selectedWallet == null) {
      throw new Error(`No mock Ledger wallet selected`);
    }
    const selectedWallet = MockLedgerConnect.selectedWallet;

    const address = Buffer.from(deriveAddress(
      selectedWallet.rootKey,
      request.params
    ).to_bytes()).toString('hex');

    const expectedAddr = Buffer.from(
      (request.params.address.type === AddressType.BYRON
        ? RustModule.WalletV4.ByronAddress.from_base58(request.params.expectedAddr).to_address()
        : RustModule.WalletV4.Address.from_bech32(request.params.expectedAddr)).to_bytes()
    ).toString('hex');

    if (address !== expectedAddr) {
      throw new Error(`Verify address failed. Expected ${expectedAddr} but device returned ${address}`);
    }

    return undefined;
  }

  deriveAddress: {|
    serial: ?string,
    params: DeriveAddressRequest,
  |} => Promise<DeriveAddressResponse> = async (request) => {
    this.checkSerial(request.serial);
    if (MockLedgerConnect.selectedWallet == null) {
      throw new Error(`No mock Ledger wallet selected`);
    }
    const selectedWallet = MockLedgerConnect.selectedWallet;

    const address = deriveAddress(
      selectedWallet.rootKey,
      request.params
    );

    return {
      addressHex: Buffer.from(address.to_bytes()).toString('hex'),
    };
  }

  getVersion: {|
    serial: ?string,
    params: void,
  |} => Promise<GetVersionResponse> = async (request) => {
    this.checkSerial(request.serial);
    if (MockLedgerConnect.selectedWallet == null) {
      throw new Error(`No mock Ledger wallet selected`);
    }
    const selectedWallet = MockLedgerConnect.selectedWallet;

    return selectedWallet.version;
  }

  getSerial: {|
    serial: ?string,
    params: void,
  |} => Promise<GetSerialResponse> = async (request) => {
    this.checkSerial(request.serial);
    if (MockLedgerConnect.selectedWallet == null) {
      throw new Error(`No mock Ledger wallet selected`);
    }
    const selectedWallet = MockLedgerConnect.selectedWallet;

    return selectedWallet.serial;
  }

  isConnectorReady: void => boolean = () => {
    return true;
  }

  dispose: void => void = () => {
    // eslint-disable-next-line no-console
    console.log('Ledger connection disposed');
  }
}

export default MockLedgerConnect;
