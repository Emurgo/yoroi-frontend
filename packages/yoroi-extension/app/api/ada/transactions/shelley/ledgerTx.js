// @flow
import type { CardanoAddressedUtxo, } from '../types';
import { verifyFromDerivationRoot } from '../../lib/storage/models/utils';
import type {
  AnchorParams,
  AssetGroup,
  Certificate,
  CredentialParams,
  DeviceOwnedAddress,
  DRepParams,
  SignTransactionRequest,
  Token,
  TxInput,
  TxOutput,
  Withdrawal,
  Witness,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import {
  AddressType,
  CertificateType,
  CIP36VoteDelegationType,
  CIP36VoteRegistrationFormat,
  CredentialParamsType,
  DatumType,
  DRepParamsType,
  TransactionSigningMode,
  TxAuxiliaryDataType,
  TxOutputDestinationType,
  TxOutputFormat,
  TxRequiredSignerType,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type { Address, Addressing, Value, } from '../../lib/storage/models/PublicDeriver/interfaces';
import { HaskellShelleyTxSignRequest } from './HaskellShelleyTxSignRequest';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { toHexOrBase58 } from '../../lib/storage/bridge/utils';
import { Bip44DerivationLevels, } from '../../lib/storage/database/walletTypes/bip44/api/utils';
import { ChainDerivations, } from '../../../../config/numbersConfig';
import { derivePublicByAddressing } from '../../lib/cardanoCrypto/deriveByAddressing';
import { bytesToHex, fail, forceNonNull, iterateLenGet, iterateLenGetMap, maybe } from '../../../../coreUtils';
import { mergeWitnessSets } from '../utils';

// ==================== LEDGER ==================== //
/** Generate a payload for Ledger SignTx */
export function createLedgerSignTxPayload(request: {|
  signRequest: HaskellShelleyTxSignRequest,
  byronNetworkMagic: number,
  networkId: number,
  addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
  cip36: boolean,
|}): SignTransactionRequest {
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

  let auxiliaryData = undefined;
  if (request.signRequest.ledgerNanoCatalystRegistrationTxSignData) {
    const { votingPublicKey, stakingKeyPath, nonce, paymentKeyPath, } =
      request.signRequest.ledgerNanoCatalystRegistrationTxSignData;

    if (request.cip36) {
      auxiliaryData = {
        type: TxAuxiliaryDataType.CIP36_REGISTRATION,
        params: {
          format: CIP36VoteRegistrationFormat.CIP_36,
          delegations: [
            {
              type: CIP36VoteDelegationType.KEY,
              voteKeyHex: votingPublicKey.replace(/^0x/, ''),
              weight: 1,
            },
          ],
          stakingPath: stakingKeyPath,
          paymentDestination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: paymentKeyPath,
                stakingPath: stakingKeyPath,
              },
            },
          },
          nonce,
          votingPurpose: 0,
        }
      };
    } else {
      auxiliaryData = {
        type: TxAuxiliaryDataType.CIP36_REGISTRATION,
        params: {
          format: CIP36VoteRegistrationFormat.CIP_15,
          voteKeyHex: votingPublicKey.replace(/^0x/, ''),
          stakingPath: stakingKeyPath,
          paymentDestination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: paymentKeyPath,
                stakingPath: stakingKeyPath,
              },
            },
          },
          nonce,
        }
      };
    }
  } else if (request.signRequest.metadata != null) {
    auxiliaryData = {
      type: TxAuxiliaryDataType.ARBITRARY_HASH,
      params: {
        hashHex: RustModule.WalletV4.hash_auxiliary_data(request.signRequest.metadata).to_hex(),
      },
    };
  }

  return {
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    tx: {
      inputs: ledgerInputs,
      outputs: ledgerOutputs,
      ttl: txBody.ttl_bignum()?.to_str() ?? null,
      validityIntervalStart: txBody.validity_start_interval_bignum()?.to_str() ?? null,
      fee: txBody.fee().to_str(),
      network: {
        networkId: request.networkId,
        protocolMagic: request.byronNetworkMagic,
      },
      withdrawals: ledgerWithdrawal.length === 0 ? null : ledgerWithdrawal,
      certificates: ledgerCertificates.length === 0 ? null : ledgerCertificates,
      auxiliaryData,
      scriptDataHashHex: txBody.script_data_hash()?.to_hex() ?? null,
    },
    additionalWitnessPaths: [],
    options: {
      tagCborSets: false,
    }
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
    verifyFromDerivationRoot(input.addressing);
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

  const assetGroup: Array<AssetGroup> = iterateLenGetMap(assets).map(([policyId, assetsForPolicy]) => {

    const tokens: Array<Token> = iterateLenGetMap(assetsForPolicy).nonNullValue().map(([assetName, amount]) => ({
      assetNameHex: bytesToHex(assetName.name()),
      amount: amount.to_str(),
    })).toArray();

    // sort by asset name to the order specified by rfc7049
    tokens.sort(
      (token1, token2) => compareCborKey(token1.assetNameHex, token2.assetNameHex)
    );

    return { policyIdHex: policyId.to_hex(), tokens };
  }).toArray();

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

  // <TODO:UPDATE> support post-alonzo map

  for (const output of iterateLenGet(request.txOutputs)) {
    const address = output.address();
    const jsAddr = toHexOrBase58(address);
    const datumHashHex = output.data_hash()?.to_hex() ?? null;

    const changeAddr = request.changeAddrs.find(change => jsAddr === change.address);
    if (changeAddr != null) {
      verifyFromDerivationRoot(changeAddr.addressing);
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
        datumHashHex,
      });
    } else {
      result.push({
        amount: output.amount().coin().to_str(),
        tokenBundle: toLedgerTokenBundle(output.amount().multiasset()),
        destination: {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: { addressHex: address.to_hex() },
        },
        datumHashHex,
      });
    }
  }
  return result;
}

function formatLedgerWithdrawals(
  withdrawals: RustModule.WalletV4.Withdrawals,
  addressingMap: string => (void | { +path: Array<number>, ... }),
): Array<Withdrawal> {
  const result = [];

  for (const [rewardAddress, withdrawalAmount] of iterateLenGetMap(withdrawals).nonNullValue()) {
    const rewardAddressPayload = rewardAddress.to_address().to_hex();
    const addressing = addressingMap(rewardAddressPayload);
    if (addressing == null) {
      throw new Error(`${nameof(formatLedgerWithdrawals)} Ledger can only withdraw from own address ${rewardAddressPayload}`);
    }
    result.push({
      amount: withdrawalAmount.to_str(),
      stakeCredential: {
        type: CredentialParamsType.KEY_PATH,
        keyPath: addressing.path,
      },
    });
  }
  return result;
}

type WasmCertWithAnchor =
  RustModule.WalletV4.DRepRegistration
  | RustModule.WalletV4.DRepUpdate;

function wasmCertToAnchor(wasmCert: WasmCertWithAnchor): ?AnchorParams {
  const wasmAnchor = wasmCert.anchor();
  return wasmAnchor == null ? undefined : {
    url: wasmAnchor.url().url(),
    hashHex: wasmAnchor.anchor_data_hash().to_hex(),
  };
}

type WasmCertWithStakeCredential =
  RustModule.WalletV4.StakeRegistration
  | RustModule.WalletV4.StakeDeregistration
  | RustModule.WalletV4.StakeDelegation
  | RustModule.WalletV4.VoteDelegation
  | RustModule.WalletV4.StakeAndVoteDelegation
  | RustModule.WalletV4.StakeRegistrationAndDelegation
  | RustModule.WalletV4.VoteRegistrationAndDelegation
  | RustModule.WalletV4.StakeVoteRegistrationAndDelegation;

function wasmCertToStakeCredential(wasmCert: WasmCertWithStakeCredential, getPath: RustModule.WalletV4.Credential => number[]): CredentialParams {
  return {
    type: CredentialParamsType.KEY_PATH,
    keyPath: getPath(wasmCert.stake_credential()),
  };
}

type WasmCertWithDrepCredential =
  RustModule.WalletV4.DRepRegistration
  | RustModule.WalletV4.DRepUpdate
  | RustModule.WalletV4.DRepDeregistration;

function wasmCertToDRepCredential(wasmCert: WasmCertWithDrepCredential, getPath: RustModule.WalletV4.Credential => number[]): CredentialParams {
  return {
    type: CredentialParamsType.KEY_PATH,
    keyPath: getPath(wasmCert.voting_credential()),
  };
}

type WasmCertWithDrepDelegation =
  RustModule.WalletV4.VoteDelegation
  | RustModule.WalletV4.StakeAndVoteDelegation
  | RustModule.WalletV4.VoteRegistrationAndDelegation
  | RustModule.WalletV4.StakeVoteRegistrationAndDelegation;

function wasmCertToDrep(wasmCert: WasmCertWithDrepDelegation): DRepParams {
  const wasmDrep = wasmCert.drep();
  switch (wasmDrep.kind()) {
    case RustModule.WalletV4.DRepKind.KeyHash:
      return {
        type: DRepParamsType.KEY_HASH,
        keyHashHex: forceNonNull(wasmDrep.to_key_hash()).to_hex(),
      };
    case RustModule.WalletV4.DRepKind.ScriptHash:
      return {
        type: DRepParamsType.SCRIPT_HASH,
        scriptHashHex: forceNonNull(wasmDrep.to_script_hash()).to_hex(),
      };
    case RustModule.WalletV4.DRepKind.AlwaysAbstain:
      return { type: DRepParamsType.ABSTAIN };
    case RustModule.WalletV4.DRepKind.AlwaysNoConfidence:
      return { type: DRepParamsType.NO_CONFIDENCE };
    default:
      throw new Error('Ledger: Unsupported dRep kind: ' + wasmDrep.to_hex());
  }
}

type WasmCertWithStakeRegistration =
  RustModule.WalletV4.StakeRegistration
  | RustModule.WalletV4.StakeRegistrationAndDelegation
  | RustModule.WalletV4.VoteRegistrationAndDelegation
  | RustModule.WalletV4.StakeVoteRegistrationAndDelegation;

function wasmCertToStakeRegistration(wasmCert: WasmCertWithStakeRegistration, getPath: RustModule.WalletV4.Credential => number[]): Certificate {
  const stakeCredential = wasmCertToStakeCredential(wasmCert, getPath);
  const coin = wasmCert.coin();
  return coin == null ? {
    type: CertificateType.STAKE_REGISTRATION,
    params: { stakeCredential },
  } : {
    type: CertificateType.STAKE_REGISTRATION_CONWAY,
    params: { stakeCredential, deposit: coin.to_str() },
  };
}

type WasmCertWithStakeDeregistration =
  | RustModule.WalletV4.StakeDeregistration;

function wasmCertToStakeDeregistration(wasmCert: WasmCertWithStakeDeregistration, getPath: RustModule.WalletV4.Credential => number[]): Certificate {
  const stakeCredential = wasmCertToStakeCredential(wasmCert, getPath);
  const coin = wasmCert.coin();
  return coin == null ? {
    type: CertificateType.STAKE_DEREGISTRATION,
    params: { stakeCredential },
  } : {
    type: CertificateType.STAKE_DEREGISTRATION_CONWAY,
    params: { stakeCredential, deposit: coin.to_str() },
  };
}


type WasmCertWithStakeDelegation =
  | RustModule.WalletV4.StakeDelegation
  | RustModule.WalletV4.StakeAndVoteDelegation
  | RustModule.WalletV4.StakeRegistrationAndDelegation
  | RustModule.WalletV4.StakeVoteRegistrationAndDelegation;

function wasmCertToStakeDelegation(wasmCert: WasmCertWithStakeDelegation, getPath: RustModule.WalletV4.Credential => number[]): Certificate {
  return {
    type: CertificateType.STAKE_DELEGATION,
    params: {
      stakeCredential: wasmCertToStakeCredential(wasmCert, getPath),
      poolKeyHashHex: wasmCert.pool_keyhash().to_hex(),
    },
  };
}

function wasmCertToVoteDelegation(wasmCert: WasmCertWithDrepDelegation, getPath: RustModule.WalletV4.Credential => number[]): Certificate {
  return {
    type: CertificateType.VOTE_DELEGATION,
    params: {
      stakeCredential: wasmCertToStakeCredential(wasmCert, getPath),
      dRep: wasmCertToDrep(wasmCert),
    },
  };
}

function convertCertificate(
  wasmCertificateWrap: RustModule.WalletV4.Certificate,
  getPath: RustModule.WalletV4.Credential => number[]
): Certificate {
  const kind = wasmCertificateWrap.kind();
  switch (kind) {
    case RustModule.WalletV4.CertificateKind.StakeRegistration: {
      const wasmCert = forceNonNull(wasmCertificateWrap.as_stake_registration());
      return wasmCertToStakeRegistration(wasmCert, getPath);
    }
    case RustModule.WalletV4.CertificateKind.StakeDeregistration: {
      const wasmCert = forceNonNull(wasmCertificateWrap.as_stake_deregistration());
      return wasmCertToStakeDeregistration(wasmCert, getPath);
    }
    case RustModule.WalletV4.CertificateKind.StakeDelegation: {
      const wasmCert = forceNonNull(wasmCertificateWrap.as_stake_delegation());
      return wasmCertToStakeDelegation(wasmCert, getPath);
    }
    case RustModule.WalletV4.CertificateKind.VoteDelegation: {
      const wasmCert = forceNonNull(wasmCertificateWrap.as_vote_delegation());
      return wasmCertToVoteDelegation(wasmCert, getPath);
    }
    case RustModule.WalletV4.CertificateKind.DRepRegistration: {
      const wasmCert = forceNonNull(wasmCertificateWrap.as_drep_registration());
      return {
        type: CertificateType.DREP_REGISTRATION,
        params: {
          dRepCredential: wasmCertToDRepCredential(wasmCert, getPath),
          anchor: wasmCertToAnchor(wasmCert),
          deposit: wasmCert.coin().to_str(),
        },
      };
    }
    case RustModule.WalletV4.CertificateKind.DRepUpdate: {
      const wasmCert = forceNonNull(wasmCertificateWrap.as_drep_update());
      return {
        type: CertificateType.DREP_UPDATE,
        params: {
          dRepCredential: wasmCertToDRepCredential(wasmCert, getPath),
          anchor: wasmCertToAnchor(wasmCert),
        },
      };
    }
    case RustModule.WalletV4.CertificateKind.DRepDeregistration: {
      const wasmCert = forceNonNull(wasmCertificateWrap.as_drep_deregistration());
      return {
        type: CertificateType.DREP_DEREGISTRATION,
        params: {
          dRepCredential: wasmCertToDRepCredential(wasmCert, getPath),
          deposit: wasmCert.coin().to_str(),
        },
      };
    }
    case RustModule.WalletV4.CertificateKind.StakeAndVoteDelegation:
    case RustModule.WalletV4.CertificateKind.StakeRegistrationAndDelegation:
    case RustModule.WalletV4.CertificateKind.VoteRegistrationAndDelegation:
    case RustModule.WalletV4.CertificateKind.StakeVoteRegistrationAndDelegation:
      throw new Error(`${nameof(formatLedgerCertificates)} Ledger doesn't support combinatory certificate types (${kind}), use multiple simple certificates instead! ` + wasmCertificateWrap.to_hex());
    default:
      throw new Error(`${nameof(formatLedgerCertificates)} Ledger doesn't support this certificate type! ` + wasmCertificateWrap.to_hex());
  }
}

function formatLedgerCertificates(
  networkId: number,
  certificates: RustModule.WalletV4.Certificates,
  addressingMap: string => (void | { +path: Array<number>, ... }),
): Array<Certificate> {
  const getPath = (
    stakeCredential: RustModule.WalletV4.Credential
  ): Array<number> => {
    const rewardAddr = RustModule.WalletV4.RewardAddress.new(
      networkId,
      stakeCredential
    );
    const addressPayload = rewardAddr.to_address().to_hex();
    const addressing = addressingMap(addressPayload);
    if (addressing == null) {
      throw new Error(`${nameof(getPath)} Ledger only supports certificates from own address ${addressPayload}`);
    }
    return addressing.path;
  };
  return iterateLenGet(certificates)
    .map(cert => convertCertificate(cert, getPath))
    .toArray();
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
      const addressPayload = rewardAddr.to_address().to_hex();
      const addressing = request.addressingMap(addressPayload);

      if (addressing == null) {
        const stakeCred = baseAddr.stake_cred();
        const wasmHash = stakeCred.to_keyhash() ?? stakeCred.to_scripthash();
        const hashInAddress = wasmHash?.to_hex()
          ?? fail(`${nameof(toLedgerAddressParameters)} unknown hash type`);

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
  tx: RustModule.WalletV4.Transaction,
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
    verifyFromDerivationRoot(utxo.addressing);

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
        RustModule.WalletV4.Ed25519Signature.from_hex(witness),
        addressKey.chaincode(),
        byronAddr.attributes(),
      );
      const asString = bootstrapWit.to_hex();
      if (seenBootstrapWit.has(asString)) {
        continue;
      }
      seenBootstrapWit.add(asString);
      bootstrapWitnesses.push(bootstrapWit);
      continue;
    }

    const vkeyWit = RustModule.WalletV4.Vkeywitness.new(
      RustModule.WalletV4.Vkey.new(addressKey.to_raw_key()),
      RustModule.WalletV4.Ed25519Signature.from_hex(witness),
    );
    const asString = vkeyWit.to_hex();
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
    verifyFromDerivationRoot(addressing);
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
        RustModule.WalletV4.Ed25519Signature.from_hex(witness.witnessSignatureHex),
      );
      const asString = vkeyWit.to_hex();
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

  const mergedWitnessSet = RustModule.WalletV4.TransactionWitnessSet.from_hex(
    mergeWitnessSets(tx.witness_set().to_hex(), witSet.to_hex())
  );

  return RustModule.WalletV4.Transaction.new(
    tx.body(),
    mergedWitnessSet,
    metadata
  );
}

type AddressMap = (addressHex: string) => ?Array<number>;

// Convert connector sign tx input into request to Ledger.
// Note this function has some overlaps in functionality with above functions but
// this function is more generic because above functions deal only with Yoroi
// extension "send" transactions.
export function toLedgerSignRequest(
  txBodyHex: string,
  networkId: number,
  protocolMagic: number,
  ownAddressMap: AddressMap,
  senderUtxos: Array<CardanoAddressedUtxo>,
  additionalRequiredSigners: Array<string> = [],
): SignTransactionRequest {

  const txBody = RustModule.WalletV4.TransactionBody.from_hex(txBodyHex);

  function formatInputs(inputs: RustModule.WalletV4.TransactionInputs): Array<TxInput> {
    return iterateLenGet(inputs).map(input => {
      const txHashHex = input.transaction_id().to_hex();
      const outputIndex = input.index();
      const ownUtxo = senderUtxos.find(utxo =>
        utxo.tx_hash === txHashHex && utxo.tx_index === outputIndex
      );
      const path = ownUtxo?.addressing.path ?? null;
      return { txHashHex, outputIndex, path };
    }).toArray();
  }

  function formatOutput(output: RustModule.WalletV4.TransactionOutput): TxOutput {

    const isPostAlonzoTransactionOutput = output.serialization_format() === RustModule.WalletV4.CborContainerType.Map;

    const addr = output.address();
    let destination;

    // Yoroi doesn't have Byron addresses or pointer addresses.
    // If the address is one of these, it's not a wallet address.
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(addr);
    const pointerAddr = RustModule.WalletV4.PointerAddress.from_address(addr);
    if (byronAddr || pointerAddr) {
      destination = {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex: addr.to_hex(),
        },
      };
    }

    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(addr);
    if (enterpriseAddr) {
      const ownAddressPath = ownAddressMap(addr.to_hex());
      if (ownAddressPath) {
        destination = {
          type: TxOutputDestinationType.DEVICE_OWNED,
          params: {
            type: AddressType.ENTERPRISE_KEY,
            params: {
              spendingPath: ownAddressPath,
            },
          },
        };
      } else {
        destination = {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex: addr.to_hex(),
          },
        };
      }
    }

    const baseAddr = RustModule.WalletV4.BaseAddress.from_address(addr);
    if (baseAddr) {
      const paymentAddress = RustModule.WalletV4.EnterpriseAddress.new(
        networkId,
        baseAddr.payment_cred()
      ).to_address().to_hex();
      const ownPaymentPath = ownAddressMap(paymentAddress);
      if (ownPaymentPath) {
        const stake = baseAddr.stake_cred();
        const stakeAddr = RustModule.WalletV4.RewardAddress.new(
          networkId,
          stake,
        ).to_address().to_hex();
        const ownStakePath = ownAddressMap(stakeAddr);
        if (ownStakePath) {
          // stake address is ours
          destination = {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: ownPaymentPath,
                stakingPath: ownStakePath,
              },
            }
          };
        } else {
          const keyHash = stake.to_keyhash();
          const scriptHash = stake.to_scripthash();
          if (keyHash) {
            // stake address is foreign key hash
            destination = {
              type: TxOutputDestinationType.DEVICE_OWNED,
              params: {
                type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
                params: {
                  spendingPath: ownPaymentPath,
                  stakingKeyHashHex: keyHash.to_hex(),
                },
              }
            };
          } else if (scriptHash) {
            // stake address is script hash
            destination = {
              type: TxOutputDestinationType.DEVICE_OWNED,
              params: {
                type: AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
                params: {
                  spendingPath: ownPaymentPath,
                  stakingScriptHashHex: scriptHash.to_hex(),
                },
              }
            };
          } else {
            throw new Error('unexpected stake credential type in base address');
          }
        }
        // not having BASE_PAYMENT_SCRIPT_ because payment script is
        // treated as third party address
      } else { // payment address is not ours
        destination = {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex: addr.to_hex(),
          },
        };
      }
    }

    // we do not allow payment to RewardAddresses
    if (!destination) {
      throw new Error('not expecting to pay to reward address');
    }

    const amount = output.amount().coin().to_str();
    const tokenBundle = toLedgerTokenBundle(output.amount().multiasset());
    const outputDataHash = output.data_hash();
    const plutusData = output.plutus_data();
    const scriptRef = output.script_ref();

    if (isPostAlonzoTransactionOutput || scriptRef || plutusData) {
      let datum = null;
      if (plutusData) {
        datum = {
          type: DatumType.INLINE,
          datumHex: plutusData.to_hex(),
        };
      } else if (outputDataHash) {
        datum = {
          type: DatumType.HASH,
          datumHashHex: outputDataHash.to_hex(),
        };
      }
      return {
        format: TxOutputFormat.MAP_BABBAGE,
        amount,
        destination,
        tokenBundle,
        datum,
        referenceScriptHex: scriptRef ? scriptRef.to_hex() : null,
      };
    }

    return {
      format: TxOutputFormat.ARRAY_LEGACY,
      amount,
      destination,
      tokenBundle,
      datumHashHex: outputDataHash ? outputDataHash.to_hex() : null,
    };
  }

  const outputs = iterateLenGet(txBody.outputs()).map(formatOutput).toArray();

  const additionalWitnessPaths = [];
  const formattedRequiredSigners = [];
  RustModule.WasmScope(Module => {
    function hashHexToOwnAddressPath(hashHex: string): ?Array<number> {
      const hash = Module.WalletV4.Ed25519KeyHash.from_hex(hashHex);
      const enterpriseAddress = Module.WalletV4.EnterpriseAddress.new(
        networkId,
        Module.WalletV4.Credential.from_keyhash(hash),
      ).to_address().to_hex();
      const stakeAddress = Module.WalletV4.RewardAddress.new(
        networkId,
        Module.WalletV4.Credential.from_keyhash(hash),
      ).to_address().to_hex();
      return ownAddressMap(enterpriseAddress)
        || ownAddressMap(stakeAddress);
    }

    iterateLenGet(txBody.required_signers())
      .map(s => s.to_hex())
      .unique()
      .forEach(hashHex => {
        const ownAddressPath = hashHexToOwnAddressPath(hashHex);
        if (ownAddressPath != null) {
          formattedRequiredSigners.push({
            type: TxRequiredSignerType.PATH,
            path: ownAddressPath,
          });
          additionalWitnessPaths.push(ownAddressPath);
        } else {
          formattedRequiredSigners.push({
            type: TxRequiredSignerType.HASH,
            hashHex,
          });
        }
      });

    for (const additionalHashHex of (additionalRequiredSigners || [])) {
      const ownAddressPath = hashHexToOwnAddressPath(additionalHashHex);
      if (ownAddressPath != null) {
        additionalWitnessPaths.push(ownAddressPath);
      }
    }
  });

  function addressingMap(addr: string): void | {| +path: Array<number> |} {
    const path = ownAddressMap(addr);
    if (path) {
      return { path };
    }
    return undefined;
  }

  let formattedCertificates = null;
  const certificates = txBody.certs();
  if (certificates) {
    formattedCertificates = formatLedgerCertificates(
      networkId,
      certificates,
      addressingMap,
    );
  }

  let formattedWithdrawals = null;
  const withdrawals = txBody.withdrawals();
  if (withdrawals) {
    formattedWithdrawals = formatLedgerWithdrawals(
      withdrawals,
      addressingMap,
    );
  }

  // TODO: support CIP36 aux data
  let formattedAuxiliaryData = null;
  const auxiliaryDataHash = txBody.auxiliary_data_hash();
  if (auxiliaryDataHash) {
    formattedAuxiliaryData = {
      type: TxAuxiliaryDataType.ARBITRARY_HASH,
      params: {
        hashHex: auxiliaryDataHash.to_hex(),
      }
    };
  }

  let formattedCollateral = null;
  const collateral = txBody.collateral();
  if (collateral) {
    formattedCollateral = formatInputs(collateral);
  }

  const formattedCollateralReturn = maybe(txBody.collateral_return(), formatOutput);

  let formattedReferenceInputs = null;
  const referenceInputs = txBody.reference_inputs();
  if (referenceInputs) {
    formattedReferenceInputs = formatInputs(referenceInputs);
  }

  let signingMode = TransactionSigningMode.ORDINARY_TRANSACTION;
  if (formattedCollateral) {
    signingMode = TransactionSigningMode.PLUTUS_TRANSACTION;
  }

  return {
    signingMode,
    tx: {
      network: {
        networkId,
        protocolMagic,
      },
      inputs: formatInputs(txBody.inputs()),
      outputs,
      fee: txBody.fee().to_str(),
      ttl: txBody.ttl_bignum()?.to_str() ?? null,
      validityIntervalStart: txBody.validity_start_interval_bignum()?.to_str() ?? null,
      certificates: formattedCertificates,
      withdrawals: formattedWithdrawals,
      auxiliaryData: formattedAuxiliaryData,
      mint: JSON.parse(txBody.mint()?.to_json() ?? 'null')?.map(
        ([policyIdHex, assets]) => ({
          policyIdHex,
          tokens: Object.keys(assets).map(assetNameHex => (
            { assetNameHex, amount: assets[assetNameHex] }
          )),
        })) ?? null,
      scriptDataHashHex: txBody.script_data_hash()?.to_hex() ??  null,
      collateralInputs: formattedCollateral,
      requiredSigners: formattedRequiredSigners.length > 0 ? formattedRequiredSigners : null,
      includeNetworkId: txBody.network_id() != null,
      collateralOutput: formattedCollateralReturn,
      totalCollateral: txBody.total_collateral()?.to_str() ?? null,
      referenceInputs: formattedReferenceInputs,
    },
    additionalWitnessPaths,
  };
}

export function buildConnectorSignedTransaction(
  rawTxHex: string,
  witnesses: Array<Witness>,
  publicKey: {|
    ...Addressing,
    key: RustModule.WalletV4.Bip32PublicKey,
  |},
): string {

  const fixedTx = RustModule.WalletV4.FixedTransaction.from_hex(rawTxHex);
  const keyLevel = publicKey.addressing.startLevel + publicKey.addressing.path.length - 1;

  for (const witness of witnesses) {
    const addressing = {
      path: witness.path,
      startLevel: 1,
    };
    verifyFromDerivationRoot(addressing);

    const witnessKey = derivePublicByAddressing({
      addressing,
      startingFrom: {
        level: keyLevel,
        key: publicKey.key,
      }
    });
    const vkeyWit = RustModule.WalletV4.Vkeywitness.new(
      RustModule.WalletV4.Vkey.new(witnessKey.to_raw_key()),
      RustModule.WalletV4.Ed25519Signature.from_hex(witness.witnessSignatureHex),
    );

    fixedTx.add_vkey_witness(vkeyWit);
  }

  return fixedTx.to_hex();
}
