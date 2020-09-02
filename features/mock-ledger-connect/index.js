// @flow

import type {
  ExtendedPublicKeyResp,
  GetVersionRequest,
  GetSerialRequest,
  GetExtendedPublicKeyRequest,
  DeriveAddressRequest,
  SignTransactionRequest,
  VerifyAddressInfoType,
} from '@emurgo/ledger-connect-handler';
import type {
  BIP32Path,
  GetVersionResponse,
  GetSerialResponse,
  DeriveAddressResponse,
  SignTransactionResponse,
  Witness,
  OutputTypeAddressParams,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import {
  generateLedgerWalletRootKey,
} from '../../app/api/ada/lib/cardanoCrypto/cryptoWallet';
import { testWallets } from '../mock-chain/TestWallets';
import { IncorrectDeviceError } from '../../app/domain/ExternalDeviceCommon';
import { AddressTypeNibbles, CertTypes } from '@cardano-foundation/ledgerjs-hw-app-cardano';

type WalletInfo = {|
  rootKey: RustModule.WalletV4.Bip32PrivateKey;
  serial: GetSerialResponse,
  version: GetVersionResponse,
|};
const mockDeviceVersion = {
  major: '2',
  minor: '0',
  patch: '4',
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
        serial: { serial },
        version: mockDeviceVersion,
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
  const spendingKey = derivePath(rootKey, request.spendingPath);

  if (request.addressTypeNibble === AddressTypeNibbles.BYRON) {
    const networkId = request.networkIdOrProtocolMagic === 764824073
      ? 1
      : 0;
    return RustModule.WalletV4.ByronAddress.from_icarus_key(
      spendingKey.to_public(),
      networkId
    ).to_address();
  }
  if (request.addressTypeNibble === AddressTypeNibbles.ENTERPRISE) {
    return RustModule.WalletV4.EnterpriseAddress.new(
      request.networkIdOrProtocolMagic,
      RustModule.WalletV4.StakeCredential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
    ).to_address();
  }
  if (request.addressTypeNibble === AddressTypeNibbles.POINTER) {
    if (request.stakingBlockchainPointer == null) {
      throw new Error(`Missing pointer information`);
    }
    const pointer = RustModule.WalletV4.Pointer.new(
      request.stakingBlockchainPointer.blockIndex,
      request.stakingBlockchainPointer.txIndex,
      request.stakingBlockchainPointer.certificateIndex
    );
    return RustModule.WalletV4.PointerAddress.new(
      request.networkIdOrProtocolMagic,
      RustModule.WalletV4.StakeCredential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
      pointer,
    ).to_address();
  }
  if (request.addressTypeNibble === AddressTypeNibbles.REWARD) {
    return RustModule.WalletV4.RewardAddress.new(
      request.networkIdOrProtocolMagic,
      RustModule.WalletV4.StakeCredential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
    ).to_address();
  }
  if (request.addressTypeNibble === AddressTypeNibbles.BASE) {
    let stakingKeyHash;
    if (request.stakingKeyHashHex != null) {
      stakingKeyHash = RustModule.WalletV4.Ed25519KeyHash.from_bytes(
        Buffer.from(request.stakingKeyHashHex, 'hex')
      );
    }
    if (request.stakingPath != null) {
      stakingKeyHash = derivePath(rootKey, request.stakingPath).to_raw_key().to_public().hash();
    }
    if (stakingKeyHash == null) {
      throw new Error(`Missing staking key information`);
    }
    return RustModule.WalletV4.BaseAddress.new(
      request.networkIdOrProtocolMagic,
      RustModule.WalletV4.StakeCredential.from_keyhash(
        spendingKey.to_public().to_raw_key().hash()
      ),
      RustModule.WalletV4.StakeCredential.from_keyhash(stakingKeyHash),
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

    if (selectedWallet.serial.serial !== serial) {
      throw new IncorrectDeviceError({
        expectedDeviceId: serial,
        responseDeviceId: selectedWallet.serial.serial,
      });
    }
  }

  static setSelectedWallet: string => Promise<void> = async (serial) => {
    MockLedgerConnect.selectedWallet = await genWalletInfo(serial);
  }

  getExtendedPublicKey: {|
    serial: ?string,
    params: GetExtendedPublicKeyRequest,
  |} => Promise<ExtendedPublicKeyResp> = async (request) => {
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
    for (const input of request.params.inputs) {
      inputs.add(
        RustModule.WalletV4.TransactionInput.new(
          RustModule.WalletV4.TransactionHash.from_bytes(Buffer.from(input.txHashHex, 'hex')),
          input.outputIndex
        )
      );
      const spendingKey = derivePath(selectedWallet.rootKey, input.path);
      keys.push({
        witGen: (hash) => spendingKey.to_raw_key().sign(hash.to_bytes()),
        path: input.path,
      });
    }
    const outputs = RustModule.WalletV4.TransactionOutputs.new();
    for (const output of request.params.outputs) {
      let address;
      if (output.addressTypeNibble != null) {
        const coercedOutput = ((output: any): OutputTypeAddressParams);
        address = deriveAddress(
          selectedWallet.rootKey,
          {
            networkIdOrProtocolMagic: output.addressTypeNibble === AddressTypeNibbles.BYRON
              ? request.params.protocolMagic
              : request.params.networkId,
            ...coercedOutput
          }
        );
      }
      if (output.addressHex != null) {
        address = RustModule.WalletV4.Address.from_bytes(Buffer.from(output.addressHex, 'hex'));
      }
      if (address == null) throw new Error(`Missing output address information ${JSON.stringify(output)}`);
      outputs.add(
        RustModule.WalletV4.TransactionOutput.new(
          address,
          RustModule.WalletV4.BigNum.from_str(output.amountStr)
        )
      );
    }

    const body = RustModule.WalletV4.TransactionBody.new(
      inputs,
      outputs,
      RustModule.WalletV4.BigNum.from_str(request.params.feeStr),
      Number.parseInt(request.params.ttlStr, 10),
    );
    if (request.params.certificates.length > 0) {
      const certs = RustModule.WalletV4.Certificates.new();
      for (const cert of request.params.certificates) {
        const stakingKey = derivePath(selectedWallet.rootKey, cert.path).to_raw_key();
        const stakeCredential = RustModule.WalletV4.StakeCredential.from_keyhash(
          stakingKey.to_public().hash()
        );
        if (cert.type === CertTypes.staking_key_registration) {
          certs.add(RustModule.WalletV4.Certificate.new_stake_registration(
            RustModule.WalletV4.StakeRegistration.new(stakeCredential)
          ));
        }
        if (cert.type === CertTypes.staking_key_deregistration) {
          keys.push({
            witGen: (hash) => stakingKey.sign(hash.to_bytes()),
            path: cert.path
          });
          certs.add(RustModule.WalletV4.Certificate.new_stake_deregistration(
            RustModule.WalletV4.StakeDeregistration.new(stakeCredential)
          ));
        }
        if (cert.type === CertTypes.delegation) {
          keys.push({
            witGen: (hash) => stakingKey.sign(hash.to_bytes()),
            path: cert.path
          });

          if (cert.poolKeyHashHex == null) throw new Error('Missing pool key hash');
          certs.add(RustModule.WalletV4.Certificate.new_stake_delegation(
            RustModule.WalletV4.StakeDelegation.new(
              stakeCredential,
              RustModule.WalletV4.Ed25519KeyHash.from_bytes(Buffer.from(cert.poolKeyHashHex, 'hex'))
            )
          ));
        }
      }
      body.set_certs(certs);
    }
    if (request.params.metadataHashHex != null) {
      body.set_metadata_hash(RustModule.WalletV4.MetadataHash.from_bytes(
        Buffer.from(request.params.metadataHashHex, 'hex')
      ));
    }
    if (request.params.withdrawals.length > 0) {
      const withdrawals = RustModule.WalletV4.Withdrawals.new();
      for (const withdrawal of request.params.withdrawals) {
        const stakingKey = derivePath(selectedWallet.rootKey, withdrawal.path).to_raw_key();
        keys.push({
          witGen: (hash) => stakingKey.sign(hash.to_bytes()),
          path: withdrawal.path
        });

        const rewardAddress = RustModule.WalletV4.RewardAddress.new(
          request.params.networkId,
          RustModule.WalletV4.StakeCredential.from_keyhash(
            stakingKey.to_public().hash()
          )
        );
        withdrawals.insert(
          rewardAddress,
          RustModule.WalletV4.BigNum.from_str(withdrawal.amountStr)
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
    };
  }

  showAddress: {|
    serial: ?string,
    params: VerifyAddressInfoType,
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
      (request.params.addressTypeNibble === AddressTypeNibbles.BYRON
        ? RustModule.WalletV4.ByronAddress.from_base58(request.params.address).to_address()
        : RustModule.WalletV4.Address.from_bech32(request.params.address)).to_bytes()
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
    params: GetVersionRequest,
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
    params: GetSerialRequest,
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
