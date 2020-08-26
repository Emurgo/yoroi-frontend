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
  WalletTypePurpose,
  ChainDerivations,
} from '../../../../config/numbersConfig';
import { derivePublicByAddressing } from '../../lib/cardanoCrypto/utils';
import { range } from 'lodash';

// ==================== LEDGER ==================== //
/** Generate a payload for Ledger SignTx */
export async function createLedgerSignTxPayload(
  signRequest: HaskellShelleyTxSignRequest,
  byronNetworkMagic: number,
  networkId: number,
): Promise<SignTransactionRequest> {
  const txBody = signRequest.self().unsignedTx.build();

  // Inputs
  const ledgerInputs = _transformToLedgerInputs(
    signRequest.self().senderUtxos
  );

  // Output
  const ledgerOutputs = _transformToLedgerOutputs(
    txBody.outputs(),
    signRequest.self().changeAddr,
    byronNetworkMagic,
  );

  // withdrawals
  const withdrawals = txBody.withdrawals();

  const getStakingKeyPath = () => {
    // TODO: this entire block is super hacky
    // need to instead pass in a mapping from wallet addresses to addressing
    // or add something similar to the sign request

    // assume the withdrawal is the same path as the UTXOs being spent
    // so just take the first UTXO arbitrarily and change it to the staking key path
    const firstUtxo = signRequest.self().senderUtxos[0];
    if (firstUtxo.addressing.startLevel !== Bip44DerivationLevels.PURPOSE.level) {
      throw new Error(`${nameof(createLedgerSignTxPayload)} unexpected addressing start level`);
    }
    const stakingKeyPath = [...firstUtxo.addressing.path];
    stakingKeyPath[Bip44DerivationLevels.CHAIN.level - 1] = ChainDerivations.CHIMERIC_ACCOUNT;
    stakingKeyPath[Bip44DerivationLevels.ADDRESS.level - 1] = 0;
    return stakingKeyPath;
  };

  const certificates = txBody.certs();
  return {
    inputs: ledgerInputs,
    outputs: ledgerOutputs,
    feeStr: txBody.fee().to_str(),
    ttlStr: txBody.ttl().toString(),
    protocolMagic: byronNetworkMagic,
    withdrawals: withdrawals == null
      ? []
      : formatLedgerWithdrawals(
        withdrawals,
        [getStakingKeyPath()],
      ),
    certificates: certificates == null
      ? []
      : formatLedgerCertificates(
        certificates,
        range(0, certificates.len()).map(_i => getStakingKeyPath()),
      ),
    metadataHashHex: undefined,
    networkId,
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

function _transformToLedgerOutputs(
  txOutputs: RustModule.WalletV4.TransactionOutputs,
  changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
  byronNetworkMagic: number,
): Array<OutputTypeAddress | OutputTypeAddressParams> {
  const result = [];
  for (let i = 0; i < txOutputs.len(); i++) {
    const output = txOutputs.get(i);
    const address = output.address();
    const jsAddr = toHexOrBase58(output.address());

    const changeAddr = changeAddrs.find(change => jsAddr === change.address);
    if (changeAddr != null) {
      verifyFromBip44Root(changeAddr.addressing);
      const addressParams = toLedgerAddressParameters(
        address,
        changeAddr.addressing.path,
        byronNetworkMagic
      );
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
  path: Array<Array<number>>,
): Array<Withdrawal> {
  const result = [];

  if (withdrawals.len() > 1) {
    // TODO: this is a problem with our CDDL library
    // since it saves withdrawals as a BTreeMap
    // which may not be the same order as present in the original tx binary
    // so we don't know which order the list we pass should be
    throw new Error(`${nameof(formatLedgerWithdrawals)} only 1 withdrawal per tx supported`);
  }
  const withdrawalKeys = withdrawals.keys();
  for (let i = 0; i < withdrawalKeys.len(); i++) {
    const withdrawalAmount = withdrawals.get(withdrawalKeys.get(i));
    if (withdrawalAmount == null) {
      throw new Error(`${nameof(formatLedgerWithdrawals)} should never happen`);
    }
    result.push({
      amountStr: withdrawalAmount.to_str(),
      path: path[i],
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

export function toLedgerAddressParameters(
  address: RustModule.WalletV4.Address,
  path: Array<number>,
  byronNetworkMagic: number,
): {|
  addressTypeNibble: $Values<typeof AddressTypeNibbles>,
  networkIdOrProtocolMagic: number,
  spendingPath: BIP32Path,
  stakingPath: ?BIP32Path,
  stakingKeyHashHex: ?string,
  stakingBlockchainPointer: ?StakingBlockchainPointer
|} {
  {
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(address);
    if (byronAddr) {
      return {
        addressTypeNibble: AddressTypeNibbles.BYRON,
        networkIdOrProtocolMagic: byronNetworkMagic,
        spendingPath: path,
        stakingPath: undefined,
        stakingKeyHashHex: undefined,
        stakingBlockchainPointer: undefined,
      };
    }
  }
  {
    const baseAddr = RustModule.WalletV4.BaseAddress.from_address(address);
    if (baseAddr) {
      const stakeCred = baseAddr.stake_cred();
      const hash = stakeCred.to_keyhash() ?? stakeCred.to_scripthash();
      if (hash == null) {
        throw new Error(`${nameof(toLedgerAddressParameters)} unknown hash type`);
      }
      return {
        addressTypeNibble: AddressTypeNibbles.BASE,
        networkIdOrProtocolMagic: baseAddr.to_address().network_id(),
        spendingPath: path,
        stakingPath: undefined,
        // can't always know staking key path since address may not belong to the wallet
        // (mangled addresss)
        stakingKeyHashHex: Buffer.from(hash.to_bytes()).toString('hex'),
        stakingBlockchainPointer: undefined,
      };
    }
  }
  {
    const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(address);
    if (ptrAddr) {
      const pointer = ptrAddr.stake_pointer();
      return {
        addressTypeNibble: AddressTypeNibbles.POINTER,
        networkIdOrProtocolMagic: ptrAddr.to_address().network_id(),
        spendingPath: path,
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
    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(address);
    if (enterpriseAddr) {
      return {
        addressTypeNibble: AddressTypeNibbles.ENTERPRISE,
        networkIdOrProtocolMagic: enterpriseAddr.to_address().network_id(),
        spendingPath: path,
        stakingPath: undefined,
        stakingKeyHashHex: undefined,
        stakingBlockchainPointer: undefined,
      };
    }
  }
  {
    const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(address);
    if (rewardAddr) {
      return {
        addressTypeNibble: AddressTypeNibbles.REWARD,
        networkIdOrProtocolMagic: rewardAddr.to_address().network_id(),
        spendingPath: path, // reward addresses use spending path
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
  witnesses: Array<Witness>,
  publicKey: {|
    keyLevel: number,
    key: RustModule.WalletV4.Bip32PublicKey,
  |},
  metadata: RustModule.WalletV4.TransactionMetadata | void
): RustModule.WalletV4.Transaction {
  // TODO: I don't know if Ledger de-duplicates witnesses, so I deduplicate myself
  const seenWitnesses = new Set<string>();

  const witSet = RustModule.WalletV4.TransactionWitnessSet.new();
  const bootstrapWitnesses: Array<RustModule.WalletV4.BootstrapWitness> = [];
  const vkeys: Array<RustModule.WalletV4.Vkeywitness> = [];
  for (const witness of witnesses) {
    if (witness.path[Bip44DerivationLevels.PURPOSE.level - 1] === WalletTypePurpose.BIP44) {
      bootstrapWitnesses.push(RustModule.WalletV4.BootstrapWitness.from_bytes(
        Buffer.from(witness.witnessSignatureHex, 'hex')
      ));
      continue;
    }
    // TODO: handle script witnesses
    const finalKey = derivePublicByAddressing({
      addressing: {
        startLevel: 1, // full path
        path: witness.path
      },
      startingFrom: {
        level: publicKey.keyLevel,
        key: publicKey.key,
      }
    });
    vkeys.push(RustModule.WalletV4.Vkeywitness.new(
      RustModule.WalletV4.Vkey.new(finalKey.to_raw_key()),
      RustModule.WalletV4.Ed25519Signature.from_bytes(Buffer.from(witness.witnessSignatureHex, 'hex')),
    ));
  }
  if (bootstrapWitnesses.length > 0) {
    const bootstrapWitWasm = RustModule.WalletV4.BootstrapWitnesses.new();
    for (const bootstrapWit of bootstrapWitnesses) {
      const bootstrapWitString = Buffer.from(bootstrapWit.to_bytes()).toString('hex');
      if (seenWitnesses.has(bootstrapWitString)) {
        continue;
      }
      seenWitnesses.add(bootstrapWitString);
      bootstrapWitWasm.add(bootstrapWit);
    }
    witSet.set_bootstraps(bootstrapWitWasm);
  }
  if (vkeys.length > 0) {
    const vkeyWitWasm = RustModule.WalletV4.Vkeywitnesses.new();
    for (const vkey of vkeys) {
      const vkeyWitString = Buffer.from(vkey.to_bytes()).toString('hex');
      if (seenWitnesses.has(vkeyWitString)) {
        continue;
      }
      seenWitnesses.add(vkeyWitString);
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
