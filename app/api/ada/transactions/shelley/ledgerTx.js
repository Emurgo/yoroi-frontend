// @flow
import type {
  CardanoAddressedUtxo,
} from '../types';
import { verifyFromBip44Root }  from '../utils';
import type {
  BIP32Path,
  StakingBlockchainPointer,
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeAddressParams,
  Withdrawal,
  Witness,
  Certificate,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type { SignTransactionRequest } from '@emurgo/ledger-connect-handler';
import type {
  Address, Value, Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';
import { HaskellShelleyTxSignRequest } from './HaskellShelleyTxSignRequest';
import { AddressTypeNibbles, CertificateTypes } from '@cardano-foundation/ledgerjs-hw-app-cardano';
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
  if (ttl == null) throw new Error(`${nameof(createLedgerSignTxPayload)} Ledger firmware doesn't support no TTL txs`);
  return {
    inputs: ledgerInputs,
    outputs: ledgerOutputs,
    ttlStr: ttl.toString(),
    feeStr: txBody.fee().to_str(),
    protocolMagic: request.byronNetworkMagic,
    withdrawals: ledgerWithdrawal,
    certificates: ledgerCertificates,
    metadataHashHex: undefined,
    networkId: request.networkId,
  };
}

function _transformToLedgerInputs(
  inputs: Array<CardanoAddressedUtxo>
): Array<InputTypeUTxO> {
  for (const input of inputs) {
    verifyFromBip44Root(input.addressing);
  }
  return inputs.map(input => ({
    txHashHex: input.tx_hash,
    outputIndex: input.tx_index,
    path: input.addressing.path,
  }));
}

function _transformToLedgerOutputs(request: {|
  networkId: number,
  txOutputs: RustModule.WalletV4.TransactionOutputs,
  changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
  addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
|}): Array<OutputTypeAddress | OutputTypeAddressParams> {
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
      if (output.amount().multiasset() != null) {
        throw new Error(`${nameof(_transformToLedgerOutputs)} Ledger firmware doesn't support multi-asset`);
      }
      result.push({
        addressTypeNibble: addressParams.addressTypeNibble,
        spendingPath: addressParams.spendingPath,
        stakingBlockchainPointer: addressParams.stakingBlockchainPointer,
        stakingKeyHashHex: addressParams.stakingKeyHashHex,
        stakingPath: addressParams.stakingPath,
        amountStr: output.amount().coin().to_str(),
      });
    } else {
      result.push({
        addressHex: Buffer.from(address.to_bytes()).toString('hex'),
        amountStr: output.amount().coin().to_str(),
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
      amountStr: withdrawalAmount.to_str(),
      path: addressing.path,
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
        type: CertificateTypes.STAKE_REGISTRATION,
        path: getPath(registrationCert.stake_credential()),
        poolKeyHashHex: undefined,
        poolRegistrationParams: undefined,
      });
      continue;
    }
    const deregistrationCert = cert.as_stake_deregistration();
    if (deregistrationCert != null) {
      result.push({
        type: CertificateTypes.STAKE_DEREGISTRATION,
        path: getPath(deregistrationCert.stake_credential()),
        poolKeyHashHex: undefined,
        poolRegistrationParams: undefined,
      });
      continue;
    }
    const delegationCert = cert.as_stake_delegation();
    if (delegationCert != null) {
      result.push({
        type: CertificateTypes.STAKE_DELEGATION,
        path: getPath(delegationCert.stake_credential()),
        poolKeyHashHex: Buffer.from(delegationCert.pool_keyhash().to_bytes()).toString('hex'),
        poolRegistrationParams: undefined,
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
|}): {|
  addressTypeNibble: $Values<typeof AddressTypeNibbles>,
  networkIdOrProtocolMagic: number,
  spendingPath: BIP32Path,
  stakingPath: ?BIP32Path,
  stakingKeyHashHex: ?string,
  stakingBlockchainPointer: ?StakingBlockchainPointer
|} {
  {
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(request.address);
    if (byronAddr) {
      return {
        addressTypeNibble: AddressTypeNibbles.BYRON,
        networkIdOrProtocolMagic: byronAddr.byron_protocol_magic(),
        spendingPath: request.path,
        stakingPath: undefined,
        stakingKeyHashHex: undefined,
        stakingBlockchainPointer: undefined,
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

      let stakingKeyInfo;
      if (addressing == null) {
        const stakeCred = baseAddr.stake_cred();
        const wasmHash = stakeCred.to_keyhash() ?? stakeCred.to_scripthash();
        if (wasmHash == null) {
          throw new Error(`${nameof(toLedgerAddressParameters)} unknown hash type`);
        }
        const hashInAddress = Buffer.from(wasmHash.to_bytes()).toString('hex');

        stakingKeyInfo = {
          stakingPath: undefined,
          // can't always know staking key path since address may not belong to the wallet
          // (mangled address)
          stakingKeyHashHex: hashInAddress,
        };
      } else {
        stakingKeyInfo = {
          stakingPath: addressing.path,
          stakingKeyHashHex: undefined,
        };
      }
      return {
        addressTypeNibble: AddressTypeNibbles.BASE,
        networkIdOrProtocolMagic: baseAddr.to_address().network_id(),
        spendingPath: request.path,
        ...stakingKeyInfo,
        stakingBlockchainPointer: undefined,
      };
    }
  }
  {
    const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(request.address);
    if (ptrAddr) {
      const pointer = ptrAddr.stake_pointer();
      return {
        addressTypeNibble: AddressTypeNibbles.POINTER,
        networkIdOrProtocolMagic: ptrAddr.to_address().network_id(),
        spendingPath: request.path,
        stakingPath: undefined,
        stakingKeyHashHex: undefined,
        stakingBlockchainPointer: {
          blockIndex: pointer.slot(),
          txIndex: pointer.tx_index(),
          certificateIndex: pointer.cert_index(),
        },
      };
    }
  }
  {
    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(request.address);
    if (enterpriseAddr) {
      return {
        addressTypeNibble: AddressTypeNibbles.ENTERPRISE,
        networkIdOrProtocolMagic: enterpriseAddr.to_address().network_id(),
        spendingPath: request.path,
        stakingPath: undefined,
        stakingKeyHashHex: undefined,
        stakingBlockchainPointer: undefined,
      };
    }
  }
  {
    const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(request.address);
    if (rewardAddr) {
      return {
        addressTypeNibble: AddressTypeNibbles.REWARD,
        networkIdOrProtocolMagic: rewardAddr.to_address().network_id(),
        spendingPath: request.path, // reward addresses use spending path
        stakingPath: undefined,
        stakingKeyHashHex: undefined,
        stakingBlockchainPointer: undefined,
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
  metadata: RustModule.WalletV4.TransactionMetadata | void
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
