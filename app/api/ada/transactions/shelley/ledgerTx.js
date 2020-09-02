// @flow
import type {
  AddressedUtxo,
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
import { AddressTypeNibbles, CertTypes } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { toHexOrBase58 } from '../../lib/storage/bridge/utils';
import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import {
  ChainDerivations,
} from '../../../../config/numbersConfig';
import { derivePublicByAddressing } from '../../lib/cardanoCrypto/utils';
import { range } from 'lodash';

// ==================== LEDGER ==================== //
/** Generate a payload for Ledger SignTx */
export async function createLedgerSignTxPayload(request: {|
  signRequest: HaskellShelleyTxSignRequest,
  byronNetworkMagic: number,
  networkId: number,
  stakingKey: ?{|
    keyHash: RustModule.WalletV4.Ed25519KeyHash,
    ...Addressing,
  |}
|}): Promise<SignTransactionRequest> {
  const txBody = request.signRequest.self().unsignedTx.build();

  // Inputs
  const ledgerInputs = _transformToLedgerInputs(
    request.signRequest.self().senderUtxos
  );

  // Output
  const ledgerOutputs = _transformToLedgerOutputs({
    txOutputs: txBody.outputs(),
    changeAddrs: request.signRequest.self().changeAddr,
    stakingKey: request.stakingKey,
  });

  // withdrawals
  const withdrawals = txBody.withdrawals();

  const certificates = txBody.certs();

  const ledgerWithdrawal = [];
  if (withdrawals != null && withdrawals.len() > 0) {
    ledgerWithdrawal.push(...formatLedgerWithdrawals(
      withdrawals,
      request.signRequest.ownWithdrawals,
    ));
  }

  const ledgerCertificates = [];
  if (certificates != null && certificates.len() > 0) {
    ledgerCertificates.push(...formatLedgerCertificates(
      certificates,
      range(0, certificates.len()).map(_i => [
        2147485500,
        2147485463,
        0 + 2147483648,
        2,
        0
      ]),
    ));
  }

  return {
    inputs: ledgerInputs,
    outputs: ledgerOutputs,
    feeStr: txBody.fee().to_str(),
    ttlStr: txBody.ttl().toString(),
    protocolMagic: request.byronNetworkMagic,
    withdrawals: ledgerWithdrawal,
    certificates: ledgerCertificates,
    metadataHashHex: undefined,
    networkId: request.networkId,
  };
}

function _transformToLedgerInputs(
  inputs: Array<AddressedUtxo>
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
  txOutputs: RustModule.WalletV4.TransactionOutputs,
  changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
  stakingKey: ?{|
    ...Addressing,
    keyHash: RustModule.WalletV4.Ed25519KeyHash,
  |}
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
        address,
        path: changeAddr.addressing.path,
        stakingKey: request.stakingKey,
      });
      result.push({
        addressTypeNibble: addressParams.addressTypeNibble,
        spendingPath: addressParams.spendingPath,
        stakingBlockchainPointer: addressParams.stakingBlockchainPointer,
        stakingKeyHashHex: addressParams.stakingKeyHashHex,
        stakingPath: addressParams.stakingPath,
        amountStr: output.amount().to_str(),
      });
    } else {
      result.push({
        addressHex: Buffer.from(address.to_bytes()).toString('hex'),
        amountStr: output.amount().to_str(),
      });
    }
  }
  return result;
}

function formatLedgerWithdrawals(
  withdrawals: RustModule.WalletV4.Withdrawals,
  ownWithdrawals: Array<{|
    keyHash: RustModule.WalletV4.Ed25519KeyHash,
    ...Addressing,
  |}>
): Array<Withdrawal> {
  if (ownWithdrawals.length !== withdrawals.len()) {
    throw new Error(`${nameof(formatLedgerWithdrawals)} Ledger can only withdraw from own wallet`);
  }
  const ownWithdrawalMap = new Map<string, Addressing>(
    ownWithdrawals.map(entry => [
      Buffer.from(entry.keyHash.to_bytes()).toString('hex'),
      { addressing: entry.addressing }
    ])
  );

  const result = [];

  const withdrawalKeys = withdrawals.keys();
  for (let i = 0; i < withdrawalKeys.len(); i++) {
    const rewardAddress = withdrawalKeys.get(i);
    const withdrawalAmount = withdrawals.get(rewardAddress);
    if (withdrawalAmount == null) {
      throw new Error(`${nameof(formatLedgerWithdrawals)} should never happen`);
    }

    const rewardKeyHash = rewardAddress.payment_cred().to_keyhash();
    if (rewardKeyHash == null) {
      throw new Error(`${nameof(formatLedgerWithdrawals)} unexpected script hash withdrawal`);
    }
    const keyHash = Buffer.from(rewardKeyHash.to_bytes()).toString('hex');
    const addressing = ownWithdrawalMap.get(keyHash);
    if (addressing == null) {
      throw new Error(`${nameof(formatLedgerWithdrawals)} no addressing information for ${keyHash}`);
    }
    result.push({
      amountStr: withdrawalAmount.to_str(),
      path: addressing.addressing.path,
    });
  }
  return result;
}
function formatLedgerCertificates(
  certificates: RustModule.WalletV4.Certificates,
  path: Array<Array<number>>,
): Array<Certificate> {
  const result = [];
  for (let i = 0; i < certificates.len(); i++) {
    const cert = certificates.get(i);
    if (cert.as_stake_registration() != null) {
      result.push({
        type: CertTypes.staking_key_registration,
        path: path[i],
        poolKeyHashHex: undefined,
      });
      continue;
    }
    if (cert.as_stake_deregistration() != null) {
      result.push({
        type: CertTypes.staking_key_deregistration,
        path: path[i],
        poolKeyHashHex: undefined,
      });
      continue;
    }
    const delegationCert = cert.as_stake_delegation();
    if (delegationCert != null) {
      result.push({
        type: CertTypes.delegation,
        path: path[i],
        poolKeyHashHex: Buffer.from(delegationCert.pool_keyhash().to_bytes()).toString('hex'),
      });
      continue;
    }
    throw new Error(`${nameof(formatLedgerCertificates)} Ledger doesn't support this certificate type`);
  }
  return result;
}

export function toLedgerAddressParameters(request: {|
  address: RustModule.WalletV4.Address,
  path: Array<number>,
  stakingKey: ?{|
    ...Addressing,
    keyHash: RustModule.WalletV4.Ed25519KeyHash,
  |}
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
      const stakeCred = baseAddr.stake_cred();
      const wasmHash = stakeCred.to_keyhash() ?? stakeCred.to_scripthash();
      if (wasmHash == null) {
        throw new Error(`${nameof(toLedgerAddressParameters)} unknown hash type`);
      }
      const hashInAddress = Buffer.from(wasmHash.to_bytes()).toString('hex');

      let stakingKeyInfo = {
        stakingPath: undefined,
        // can't always know staking key path since address may not belong to the wallet
        // (mangled address)
        stakingKeyHashHex: hashInAddress,
      };
      if (request.stakingKey != null) {
        const { stakingKey } = request;
        const ourKeyHex = Buffer.from(request.stakingKey.keyHash.to_bytes()).toString('hex');
        if (ourKeyHex === hashInAddress) {
          stakingKeyInfo = {
            stakingPath: stakingKey.addressing.path,
            stakingKeyHashHex: undefined,
          };
        }
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
  senderUtxos: Array<AddressedUtxo>,
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
