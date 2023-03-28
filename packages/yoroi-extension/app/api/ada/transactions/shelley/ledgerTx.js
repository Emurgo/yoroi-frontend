// @flow
import type {
  CardanoAddressedUtxo,
} from '../types';
import { verifyFromBip44Root }  from '../../lib/storage/models/utils';
import type {
  DeviceOwnedAddress,
  Withdrawal,
  Witness,
  Certificate,
  AssetGroup,
  Token,
  TxOutput,
  TxInput,
  SignTransactionRequest,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type {
  Address, Value, Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';
import { HaskellShelleyTxSignRequest } from './HaskellShelleyTxSignRequest';
import {
  AddressType,
  CertificateType,
  TransactionSigningMode,
  TxOutputDestinationType,
  TxAuxiliaryDataType,
  StakeCredentialParamsType,
  CIP36VoteRegistrationFormat,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { toHexOrBase58 } from '../../lib/storage/bridge/utils';
import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import {
  ChainDerivations,
} from '../../../../config/numbersConfig';
import { derivePublicByAddressing } from '../../lib/cardanoCrypto/utils';

// ==================== LEDGER ==================== //
/** Generate a payload for Ledger SignTx */
export async function createLedgerSignTxPayload(request: {|
  signRequest: HaskellShelleyTxSignRequest,
  byronNetworkMagic: number,
  networkId: number,
  addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
|}): Promise<SignTransactionRequest> {
  const txBody = request.signRequest.unsignedTx.build();

  // Inputs
  const ledgerInputs = _transformToLedgerInputs(
    request.signRequest.senderUtxos
  );

  // Output
  const ledgerOutputs = _transformToLedgerOutputs({
    networkId: request.networkId,
    txOutputs: txBody.outputs(),
    changeAddrs: request.signRequest.changeAddr,
    addressingMap: request.addressingMap,
  });

  // withdrawals
  const withdrawals = txBody.withdrawals();

  const certificates = txBody.certs();

  const ledgerWithdrawal = [];
  if (withdrawals != null && withdrawals.len() > 0) {
    ledgerWithdrawal.push(...formatLedgerWithdrawals(
      withdrawals,
      request.addressingMap,
    ));
  }

  const ledgerCertificates = [];
  if (certificates != null && certificates.len() > 0) {
    ledgerCertificates.push(...formatLedgerCertificates(
      request.networkId,
      certificates,
      request.addressingMap,
    ));
  }

  const ttl = txBody.ttl();

  let auxiliaryData = undefined;
  if (request.signRequest.ledgerNanoCatalystRegistrationTxSignData) {
    const { votingPublicKey, stakingKeyPath, nonce } =
      request.signRequest.ledgerNanoCatalystRegistrationTxSignData;

    auxiliaryData = {
      type: TxAuxiliaryDataType.CIP36_REGISTRATION,
      params: {
        format: CIP36VoteRegistrationFormat.CIP_15,
        voteKeyHex: votingPublicKey.replace(/^0x/, ''),
        stakingPath: stakingKeyPath,
        paymentDestination: {
          type: TxOutputDestinationType.DEVICE_OWNED,
          params: {
            type: AddressType.REWARD_KEY,
            params: {
              stakingPath: stakingKeyPath,
            },
          },
        },
        nonce,
      }
    };
  } else if (request.signRequest.metadata != null) {
    auxiliaryData = {
      type: TxAuxiliaryDataType.ARBITRARY_HASH,
      params: {
        hashHex: Buffer.from(
          RustModule.WalletV4.hash_auxiliary_data(request.signRequest.metadata).to_bytes()
        ).toString('hex'),
      },
    };
  }

  return {
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    tx: {
      inputs: ledgerInputs,
      outputs: ledgerOutputs,
      ttl: ttl === undefined ? ttl : ttl.toString(),
      fee: txBody.fee().to_str(),
      network: {
        networkId: request.networkId,
        protocolMagic: request.byronNetworkMagic,
      },
      withdrawals: ledgerWithdrawal.length === 0 ? null : ledgerWithdrawal,
      certificates: ledgerCertificates.length === 0 ? null : ledgerCertificates,
      auxiliaryData,
      validityIntervalStart: undefined,
    },
    additionalWitnessPaths: [],
  };
}

/**
 * Canonical inputs sorting: by tx hash and then by index
 */
function compareInputs(a: TxInput, b: TxInput): number {
  if (a.txHashHex !== b.txHashHex) {
    return a.txHashHex < b.txHashHex ? -1 : 1;
  }
  return a.outputIndex - b.outputIndex;
}

function _transformToLedgerInputs(
  inputs: Array<CardanoAddressedUtxo>
): Array<TxInput> {
  for (const input of inputs) {
    verifyFromBip44Root(input.addressing);
  }
  return inputs.map(input => ({
    txHashHex: input.tx_hash,
    outputIndex: input.tx_index,
    path: input.addressing.path,
  })).sort(compareInputs);
}

function toLedgerTokenBundle(
  assets: ?RustModule.WalletV4.MultiAsset
): Array<AssetGroup> | null {
  if (assets == null) return null;
  const assetGroup: Array<AssetGroup> = [];

  const policyHashes = assets.keys();
  for (let i = 0; i < policyHashes.len(); i++) {
    const policyId = policyHashes.get(i);
    const assetsForPolicy = assets.get(policyId);
    if (assetsForPolicy == null) continue;

    const tokens: Array<Token> = [];
    const assetNames = assetsForPolicy.keys();
    for (let j = 0; j < assetNames.len(); j++) {
      const assetName = assetNames.get(j);
      const amount = assetsForPolicy.get(assetName);
      if (amount == null) continue;

      tokens.push({
        amount: amount.to_str(),
        assetNameHex: Buffer.from(assetName.name()).toString('hex'),
      });
    }
    // sort by asset name to the order specified by rfc7049
    tokens.sort(
      (token1, token2) => compareCborKey(token1.assetNameHex, token2.assetNameHex)
    );
    assetGroup.push({
      policyIdHex: Buffer.from(policyId.to_bytes()).toString('hex'),
      tokens,
    });
  }
  // sort by policy id to the order specified by rfc7049
  assetGroup.sort(
    (asset1, asset2) => compareCborKey(asset1.policyIdHex, asset2.policyIdHex)
  );
  return assetGroup;
}

/*
 Compare two hex string keys according to the key order specified by RFC 7049:
  *  If two keys have different lengths, the shorter one sorts
     earlier;

  *  If two keys have the same length, the one with the lower value
     in (byte-wise) lexical order sorts earlier.
*/
function compareCborKey(hex1: string, hex2: string): number {
  if (hex1.length < hex2.length) {
    return -1;
  }
  if (hex1.length > hex2.length) {
    return 1;
  }
  if (hex1 < hex2) {
    return -1;
  }
  if (hex1 > hex2) {
    return 1;
  }
  return 0;
}

function _transformToLedgerOutputs(request: {|
  networkId: number,
  txOutputs: RustModule.WalletV4.TransactionOutputs,
  changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
  addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
|}): Array<TxOutput> {
  const result = [];
  for (let i = 0; i < request.txOutputs.len(); i++) {
    const output = request.txOutputs.get(i);
    const address = output.address();
    const jsAddr = toHexOrBase58(output.address());

    const changeAddr = request.changeAddrs.find(change => jsAddr === change.address);
    if (changeAddr != null) {
      verifyFromBip44Root(changeAddr.addressing);
      const addressParams = toLedgerAddressParameters({
        networkId: request.networkId,
        address,
        path: changeAddr.addressing.path,
        addressingMap: request.addressingMap,
      });
      result.push({
        amount: output.amount().coin().to_str(),
        tokenBundle: toLedgerTokenBundle(output.amount().multiasset()),
        destination: {
          type: TxOutputDestinationType.DEVICE_OWNED,
          params: addressParams,
        },
      });
    } else {
      result.push({
        amount: output.amount().coin().to_str(),
        tokenBundle: toLedgerTokenBundle(output.amount().multiasset()),
        destination: {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex: Buffer.from(address.to_bytes()).toString('hex'),
          },
        }
      });
    }
  }
  return result;
}

function formatLedgerWithdrawals(
  withdrawals: RustModule.WalletV4.Withdrawals,
  addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
): Array<Withdrawal> {
  const result = [];

  const withdrawalKeys = withdrawals.keys();
  for (let i = 0; i < withdrawalKeys.len(); i++) {
    const rewardAddress = withdrawalKeys.get(i);
    const withdrawalAmount = withdrawals.get(rewardAddress);
    if (withdrawalAmount == null) {
      throw new Error(`${nameof(formatLedgerWithdrawals)} should never happen`);
    }

    const rewardAddressPayload = Buffer.from(rewardAddress.to_address().to_bytes()).toString('hex');
    const addressing = addressingMap(rewardAddressPayload);
    if (addressing == null) {
      throw new Error(`${nameof(formatLedgerWithdrawals)} Ledger can only withdraw from own address ${rewardAddressPayload}`);
    }
    result.push({
      amount: withdrawalAmount.to_str(),
      stakeCredential: {
        type: StakeCredentialParamsType.KEY_PATH,
        keyPath: addressing.path,
      },
    });
  }
  return result;
}
function formatLedgerCertificates(
  networkId: number,
  certificates: RustModule.WalletV4.Certificates,
  addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
): Array<Certificate> {
  const getPath = (
    stakeCredential: RustModule.WalletV4.StakeCredential
  ): Array<number> => {
    const rewardAddr = RustModule.WalletV4.RewardAddress.new(
      networkId,
      stakeCredential
    );
    const addressPayload = Buffer.from(rewardAddr.to_address().to_bytes()).toString('hex');
    const addressing = addressingMap(addressPayload);
    if (addressing == null) {
      throw new Error(`${nameof(getPath)} Ledger only supports certificates from own address ${addressPayload}`);
    }
    return addressing.path;
  };

  const result = [];
  for (let i = 0; i < certificates.len(); i++) {
    const cert = certificates.get(i);

    const registrationCert = cert.as_stake_registration();
    if (registrationCert != null) {
      result.push({
        type: CertificateType.STAKE_REGISTRATION,
        params: {
          stakeCredential: {
            type: StakeCredentialParamsType.KEY_PATH,
            keyPath: getPath(registrationCert.stake_credential()),
          },
        }
      });
      continue;
    }
    const deregistrationCert = cert.as_stake_deregistration();
    if (deregistrationCert != null) {
      result.push({
        type: CertificateType.STAKE_DEREGISTRATION,
        params: {
          stakeCredential: {
            type: StakeCredentialParamsType.KEY_PATH,
            keyPath: getPath(deregistrationCert.stake_credential()),
          },
        },
      });
      continue;
    }
    const delegationCert = cert.as_stake_delegation();
    if (delegationCert != null) {
      result.push({
        type: CertificateType.STAKE_DELEGATION,
        params: {
          stakeCredential: {
            type: StakeCredentialParamsType.KEY_PATH,
            keyPath: getPath(delegationCert.stake_credential()),
          },
          poolKeyHashHex: Buffer.from(delegationCert.pool_keyhash().to_bytes()).toString('hex'),
        },
      });
      continue;
    }
    throw new Error(`${nameof(formatLedgerCertificates)} Ledger doesn't support this certificate type`);
  }
  return result;
}

export function toLedgerAddressParameters(request: {|
  networkId: number,
  address: RustModule.WalletV4.Address,
  path: Array<number>,
  addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
|}): DeviceOwnedAddress {
  {
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(request.address);
    if (byronAddr) {
      return {
        type: AddressType.BYRON,
        params: {
          spendingPath: request.path,
        },
      };
    }
  }
  {
    const baseAddr = RustModule.WalletV4.BaseAddress.from_address(request.address);
    if (baseAddr) {
      const rewardAddr = RustModule.WalletV4.RewardAddress.new(
        request.networkId,
        baseAddr.stake_cred()
      );
      const addressPayload = Buffer.from(rewardAddr.to_address().to_bytes()).toString('hex');
      const addressing = request.addressingMap(addressPayload);

      if (addressing == null) {
        const stakeCred = baseAddr.stake_cred();
        const wasmHash = stakeCred.to_keyhash() ?? stakeCred.to_scripthash();
        if (wasmHash == null) {
          throw new Error(`${nameof(toLedgerAddressParameters)} unknown hash type`);
        }
        const hashInAddress = Buffer.from(wasmHash.to_bytes()).toString('hex');

        return {
          // can't always know staking key path since address may not belong to the wallet
          // (mangled address)
          type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
          params: {
            spendingPath: request.path,
            stakingKeyHashHex: hashInAddress,
          },
        };
      }
      return {
        type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
        params: {
          spendingPath: request.path,
          stakingPath: addressing.path,
        },
      };
    }
  }
  {
    const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(request.address);
    if (ptrAddr) {
      const pointer = ptrAddr.stake_pointer();
      return {
        type: AddressType.POINTER_KEY,
        params: {
          spendingPath: request.path,
          stakingBlockchainPointer: {
            blockIndex: pointer.slot(),
            txIndex: pointer.tx_index(),
            certificateIndex: pointer.cert_index(),
          },
        },
      };
    }
  }
  {
    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(request.address);
    if (enterpriseAddr) {
      return {
        type: AddressType.ENTERPRISE_KEY,
        params: {
          spendingPath: request.path,
        },
      };
    }
  }
  {
    const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(request.address);
    if (rewardAddr) {
      return {
        type: AddressType.REWARD_KEY,
        params: {
          stakingPath: request.path, // reward addresses use spending path
        },
      };
    }
  }
  throw new Error(`${nameof(toLedgerAddressParameters)} unknown address type`);
}

export function buildSignedTransaction(
  txBody: RustModule.WalletV4.TransactionBody,
  senderUtxos: Array<CardanoAddressedUtxo>,
  witnesses: Array<Witness>,
  publicKey: {|
    ...Addressing,
    key: RustModule.WalletV4.Bip32PublicKey,
  |},
  metadata: RustModule.WalletV4.AuxiliaryData | void
): RustModule.WalletV4.Transaction {
  const isSameArray = (array1: Array<number>, array2: Array<number>) => (
    array1.length === array2.length && array1.every((value, index) => value === array2[index])
  );
  const findWitness = (path: Array<number>) => {
    for (const witness of witnesses) {
      if (isSameArray(witness.path, path)) {
        return witness.witnessSignatureHex;
      }
    }
    throw new Error(`${nameof(buildSignedTransaction)} no witness for ${JSON.stringify(path)}`);
  };

  const keyLevel = publicKey.addressing.startLevel + publicKey.addressing.path.length - 1;

  const witSet = RustModule.WalletV4.TransactionWitnessSet.new();
  const bootstrapWitnesses: Array<RustModule.WalletV4.BootstrapWitness> = [];
  const vkeys: Array<RustModule.WalletV4.Vkeywitness> = [];

  // Note: Ledger removes duplicate witnesses
  // but there may be a one-to-many relationship
  // ex: same witness is used in both a bootstrap witness and a vkey witness
  const seenVKeyWit = new Set<string>();
  const seenBootstrapWit = new Set<string>();

  for (const utxo of senderUtxos) {
    verifyFromBip44Root(utxo.addressing);

    const witness = findWitness(utxo.addressing.path);
    const addressKey = derivePublicByAddressing({
      addressing: utxo.addressing,
      startingFrom: {
        level: keyLevel,
        key: publicKey.key,
      }
    });

    if (RustModule.WalletV4.ByronAddress.is_valid(utxo.receiver)) {

      const byronAddr = RustModule.WalletV4.ByronAddress.from_base58(utxo.receiver);
      const bootstrapWit = RustModule.WalletV4.BootstrapWitness.new(
        RustModule.WalletV4.Vkey.new(addressKey.to_raw_key()),
        RustModule.WalletV4.Ed25519Signature.from_bytes(
          Buffer.from(witness, 'hex')
        ),
        addressKey.chaincode(),
        byronAddr.attributes(),
      );
      const asString = Buffer.from(bootstrapWit.to_bytes()).toString('hex');
      if (seenBootstrapWit.has(asString)) {
        continue;
      }
      seenBootstrapWit.add(asString);
      bootstrapWitnesses.push(bootstrapWit);
      continue;
    }

    const vkeyWit = RustModule.WalletV4.Vkeywitness.new(
      RustModule.WalletV4.Vkey.new(addressKey.to_raw_key()),
      RustModule.WalletV4.Ed25519Signature.from_bytes(
        Buffer.from(witness, 'hex')
      ),
    );
    const asString = Buffer.from(vkeyWit.to_bytes()).toString('hex');
    if (seenVKeyWit.has(asString)) {
      continue;
    }
    seenVKeyWit.add(asString);
    vkeys.push(vkeyWit);
  }

  // add any staking key needed
  for (const witness of witnesses) {
    const addressing = {
      path: witness.path,
      startLevel: 1,
    };
    verifyFromBip44Root(addressing);
    if (witness.path[Bip44DerivationLevels.CHAIN.level - 1] === ChainDerivations.CHIMERIC_ACCOUNT) {
      const stakingKey = derivePublicByAddressing({
        addressing,
        startingFrom: {
          level: keyLevel,
          key: publicKey.key,
        }
      });
      const vkeyWit = RustModule.WalletV4.Vkeywitness.new(
        RustModule.WalletV4.Vkey.new(stakingKey.to_raw_key()),
        RustModule.WalletV4.Ed25519Signature.from_bytes(Buffer.from(witness.witnessSignatureHex, 'hex')),
      );
      const asString = Buffer.from(vkeyWit.to_bytes()).toString('hex');
      if (seenVKeyWit.has(asString)) {
        continue;
      }
      seenVKeyWit.add(asString);
      vkeys.push(vkeyWit);
    }
  }
  if (bootstrapWitnesses.length > 0) {
    const bootstrapWitWasm = RustModule.WalletV4.BootstrapWitnesses.new();
    for (const bootstrapWit of bootstrapWitnesses) {
      bootstrapWitWasm.add(bootstrapWit);
    }
    witSet.set_bootstraps(bootstrapWitWasm);
  }
  if (vkeys.length > 0) {
    const vkeyWitWasm = RustModule.WalletV4.Vkeywitnesses.new();
    for (const vkey of vkeys) {
      vkeyWitWasm.add(vkey);
    }
    witSet.set_vkeys(vkeyWitWasm);
  }
  // TODO: handle script witnesses
  return RustModule.WalletV4.Transaction.new(
    txBody,
    witSet,
    metadata
  );
}
