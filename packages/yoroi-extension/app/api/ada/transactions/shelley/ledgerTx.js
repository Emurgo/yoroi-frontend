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
  VoterType,
  VoteOption,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type { Addressing, Address, Value } from '../../lib/storage/models/PublicDeriver/interfaces';
import type { LedgerNanoCatalystRegistrationTxSignData } from './HaskellShelleyTxSignRequest';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { WalletTypePurpose, HARD_DERIVATION_START } from '../../../../config/numbersConfig';
import { derivePublicByAddressing } from '../../lib/cardanoCrypto/deriveByAddressing';
import {
  bytesToHex,
  fail,
  forceNonNull,
  hexToBytes,
  iterateLenGet,
  iterateLenGetMap,
  maybe
} from '../../../../coreUtils';
import { transactionHexToHash } from '../../lib/cardanoCrypto/utils';

// ==================== LEDGER ==================== //
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

function formatLedgerWithdrawals(
  withdrawals: RustModule.WalletV4.Withdrawals,
  addressingMap: string => (void | { +path: Array<number>, ... }),
): Array<Withdrawal> {
  const result = [];

  for (const [rewardAddress, withdrawalAmount] of iterateLenGetMap(withdrawals).nonNullValue()) {
    const rewardAddressPayload = rewardAddress.to_address().to_hex();
    const addressing = addressingMap(rewardAddressPayload);
    let stakeCredential;
    if (addressing != null) {
      stakeCredential = {
        type: CredentialParamsType.KEY_PATH,
        keyPath: addressing.path,
      };
    } else {
      const cred = rewardAddress.payment_cred();
      const maybeKeyHash = cred.to_keyhash();
      const maybeScriptHash = cred.to_scripthash();
      if (maybeKeyHash) {
        stakeCredential = {
          type: CredentialParamsType.KEY_HASH,
          keyHashHex: maybeKeyHash.to_hex(),
        };
      } else if (maybeScriptHash) {
        stakeCredential = {
          type: CredentialParamsType.SCRIPT_HASH,
          scriptHashHex: maybeScriptHash.to_hex(),
        };
      }
    }
    if (stakeCredential == null) {
      throw new Error('Failed to resolve credential type for reward address: ' + rewardAddressPayload);
    }
    result.push({
      amount: withdrawalAmount.to_str(),
      stakeCredential,
    });
  }
  // $FlowIgnore[incompatible-return]
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
  // when sending money, `ownAddressMap` doesn't contain the change address, so we need to
  // pass it in explicitly
  changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
  senderUtxos: Array<CardanoAddressedUtxo>,
  additionalRequiredSigners: Array<string> = [],
  ledgerSupportsCip36?: boolean,
  catalystData?: LedgerNanoCatalystRegistrationTxSignData,
): SignTransactionRequest {

  const tagsState = RustModule.WasmScope(Module => Module.WalletV4.has_transaction_set_tag(
    Module.WalletV4.FixedTransaction.new_from_body_bytes(hexToBytes(txBodyHex)).to_bytes()
  ));

  if (tagsState === RustModule.WalletV4.TransactionSetsState.MixedSets) {
    throw new Error('Transaction with mixed sets cannot be signed by Ledger');
  }

  const txHasSetTags = tagsState === RustModule.WalletV4.TransactionSetsState.AllSetsHaveTag;

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
      const ownPaymentPath = ownAddressMap(paymentAddress) ||
        changeAddrs.find(({ address }) => address === addr.to_hex())?.addressing.path;
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

  // note: we know that `catelystData` is only used for voting in the extension and there
  // should be no other auxiliary data in this scenario so we just overwrite the auxiliary data
  if (catalystData) {
    const { votingPublicKey, stakingKeyPath, nonce, paymentKeyPath, } = catalystData;

    if (ledgerSupportsCip36) {
     formattedAuxiliaryData = {
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
      formattedAuxiliaryData = {
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

  let formattedVotingProcedures = null;
  const votingProcedures = txBody.voting_procedures();
  if (votingProcedures) {
    formattedVotingProcedures = [];
    const voters = votingProcedures.get_voters();
    for (let i = 0; i < voters.len(); i++) {
      const voter = voters.get(i);
      if (!voter) {
        throw new Error('unexpectedly missing voter');
      }
      let formattedVoter;

      const dRepCred = voter.to_drep_credential();
      if (dRepCred) {
        const dRepCredKeyHash = dRepCred.to_keyhash();
        if (dRepCredKeyHash) {
          formattedVoter = {
            type: VoterType.DREP_KEY_PATH,
            // fixme
            keyPath: [
              1852 + HARD_DERIVATION_START,
              1815 + HARD_DERIVATION_START,
              0 + HARD_DERIVATION_START,
              3,
              0
            ],
          };
        }
        // else
        const dRepCredScriptHash = dRepCred.to_scripthash();
        if (dRepCredScriptHash) {
          formattedVoter = {
            type: VoterType.DREP_SCRIPT_HASH,
            scriptHashHex: dRepCredScriptHash.to_hex(),
          };
        }
      }
      // else
      const stakePoolKeyHash = voter.to_stake_pool_key_hash();
      if (stakePoolKeyHash) {
        // todo: support key path for friendly UI
        formattedVoter = {
          type: VoterType.STAKE_POOL_KEY_HASH,
          keyHashHex: stakePoolKeyHash.to_hex(),
        };
      }
      // don't support cc hot credential for now
      
      if (!formattedVoter) {
        throw new Error('unexpected voter');
      }
      formattedVotingProcedures.push({
        voter: formattedVoter,
        votes: [],
      });
      const govActionIds = votingProcedures.get_governance_action_ids_by_voter(voter);
      for (let j = 0; j < govActionIds.len(); j++) {
        const govActionId = govActionIds.get(j);
        if (!govActionId) {
          throw new Error('unexpectedly missing gov action id')
        }
        const votingProcedure = votingProcedures.get(voter, govActionId);
        if (!votingProcedure) {
          throw new Error('unexpectedly missing voting procedure')
        }
        const voteKind = votingProcedure.vote_kind();
        let formattedVoteKind;
        if (voteKind === 0) {
          formattedVoteKind = VoteOption.NO;
        } else if (voteKind === 1) {
          formattedVoteKind = VoteOption.YES;
        } else if (voteKind === 2) {
          formattedVoteKind = VoteOption.ABSTAIN;
        } else {
          throw new Error(`unexpected vote kind ${voteKind}`);
        }
        const anchor = votingProcedure.anchor();

        formattedVotingProcedures[formattedVotingProcedures.length - 1].votes.push({
          govActionId: {
            txHashHex: govActionId.transaction_id().to_hex(),
            govActionIndex: govActionId.index(),
          },
          votingProcedure: {
            vote: formattedVoteKind,
            anchor: anchor ? {
              url: anchor.url().url(),
              hashHex: anchor.anchor_data_hash().to_hex(),
            } : null,
          },
        });
      }
    }
  }

  let signingMode = TransactionSigningMode.ORDINARY_TRANSACTION;
  if (formattedCollateral || formattedReferenceInputs) {
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
      votingProcedures: formattedVotingProcedures,
    },
    additionalWitnessPaths,
    options: {
      tagCborSets: txHasSetTags,
    },
  };
}

export function buildConnectorSignedTransaction(
  rawTxHex: string,
  witnesses: Array<Witness>,
  publicKey: {|
    ...Addressing,
    key: RustModule.WalletV4.Bip32PublicKey,
  |},
  metadata: ?RustModule.WalletV4.AuxiliaryData,
  // to support transfering from Byron address when initializing Ledger wallets
  pathToReceiverMapping: Map<string, string> = new Map(),
): {| txHex: string, txId: string |} {

  const fixedTx = RustModule.WalletV4.FixedTransaction.from_hex(rawTxHex);
  if (metadata) {
    fixedTx.set_auxiliary_data(metadata.to_bytes());
    const body = fixedTx.body();
    body.set_auxiliary_data_hash(RustModule.WalletV4.hash_auxiliary_data(metadata));
    fixedTx.set_body(body.to_bytes());
  }
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
    if (witness.path[0] === WalletTypePurpose.BIP44) {
      const receiver = pathToReceiverMapping.get(witness.path.join('/'));
      if (!receiver) {
        continue;
      }
      const bootstrapWit = RustModule.WalletV4.BootstrapWitness.new(
        RustModule.WalletV4.Vkey.new(witnessKey.to_raw_key()),
        RustModule.WalletV4.Ed25519Signature.from_hex(witness.witnessSignatureHex),
        witnessKey.chaincode(),
        RustModule.WalletV4.ByronAddress.from_base58(receiver).attributes(),
      );

      fixedTx.add_bootstrap_witness(bootstrapWit);
    } else if (witness.path[0] === WalletTypePurpose.CIP1852) {
      const vkeyWit = RustModule.WalletV4.Vkeywitness.new(
        RustModule.WalletV4.Vkey.new(witnessKey.to_raw_key()),
        RustModule.WalletV4.Ed25519Signature.from_hex(witness.witnessSignatureHex),
      );

      fixedTx.add_vkey_witness(vkeyWit);
    } else {
      throw new Error(`unexpected witness path purpose value ${witness.path[0]}`);
    }
  }
  const txHex = fixedTx.to_hex();
  return { txHex, txId: transactionHexToHash(txHex)};
}
