// // @flow
import type {
  CardanoAddressedUtxo,
} from '../types';
import { verifyFromBip44Root }  from '../../lib/storage/models/utils';
import { toDerivationPathString } from '../../../common/lib/crypto/keys/path';
import type {
  CardanoSignTransaction,
  CardanoInput,
  CardanoOutput,
  CardanoWithdrawal,
  CardanoCertificate,
  CardanoAddressParameters,
  CardanoAssetGroup,
  CardanoToken,
  CardanoSignedTxWitness,
} from 'trezor-connect/lib/types/networks/cardano';
import {
  CERTIFICATE_TYPE,
  ADDRESS_TYPE,
} from 'trezor-connect/lib/constants/cardano';
import { CardanoTxSigningMode, CardanoTxWitnessType, } from 'trezor-connect';
import type {
  Address, Value, Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';
import { HaskellShelleyTxSignRequest } from './HaskellShelleyTxSignRequest';
import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import {
  ChainDerivations,
} from '../../../../config/numbersConfig';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { range } from 'lodash';
import { toHexOrBase58 } from '../../lib/storage/bridge/utils';
import { derivePublicByAddressing } from '../../lib/cardanoCrypto/utils';

// ==================== TREZOR ==================== //
/** Generate a payload for Trezor SignTx */
export async function createTrezorSignTxPayload(
  signRequest: HaskellShelleyTxSignRequest,
  byronNetworkMagic: number,
  networkId: number,
): Promise<$Exact<CardanoSignTransaction>> {
  const stakingKeyPath = (() => {
    // TODO: this entire block is super hacky
    // need to instead pass in a mapping from wallet addresses to addressing
    // or add something similar to the sign request

    // assume the withdrawal is the same path as the UTXOs being spent
    // so just take the first UTXO arbitrarily and change it to the staking key path
    const firstUtxo = signRequest.senderUtxos[0];
    if (firstUtxo.addressing.startLevel !== Bip44DerivationLevels.PURPOSE.level) {
      throw new Error(`${nameof(createTrezorSignTxPayload)} unexpected addressing start level`);
    }
    const result = [...firstUtxo.addressing.path];
    result[Bip44DerivationLevels.CHAIN.level - 1] = ChainDerivations.CHIMERIC_ACCOUNT;
    result[Bip44DerivationLevels.ADDRESS.level - 1] = 0;
    return result;
  })();

  const txBody = signRequest.unsignedTx.build();

  // Inputs
  const trezorInputs = _transformToTrezorInputs(
    signRequest.senderUtxos
  );

  // Output
  const trezorOutputs = _generateTrezorOutputs(
    txBody.outputs(),
    signRequest.changeAddr,
    stakingKeyPath,
  );

  let request = {
    signingMode: CardanoTxSigningMode.ORDINARY_TRANSACTION,
    inputs: trezorInputs,
    outputs: trezorOutputs,
    fee: txBody.fee().to_str(),
    ttl: txBody.ttl()?.toString(),
    protocolMagic: byronNetworkMagic,
    networkId,
  };

  // withdrawals
  const withdrawals = txBody.withdrawals();
  request = withdrawals == null
    ? request
    : {
      ...request,
      withdrawals: formatTrezorWithdrawals(
        withdrawals,
        [stakingKeyPath],
      )
    };

  // certificates
  const certificates = txBody.certs();
  request = certificates == null
    ? request
    : {
      ...request,
      certificates: formatTrezorCertificates(
        certificates,
        range(0, certificates.len()).map(_i => stakingKeyPath),
      )
    };

  if (signRequest.trezorTCatalystRegistrationTxSignData) {
    const { votingPublicKey, nonce } = signRequest.trezorTCatalystRegistrationTxSignData;
    request = {
      ...request,
      auxiliaryData: {
        catalystRegistrationParameters: {
          votingPublicKey: votingPublicKey.replace(/^0x/, ''),
          stakingPath: stakingKeyPath,
          rewardAddressParameters: {
            addressType: ADDRESS_TYPE.Reward,
            path: stakingKeyPath,
          },
          nonce: String(nonce),
        },
      }
    };
  } else {
    const metadata = signRequest.metadata;
    request = metadata === undefined
      ? request
      : {
        ...request,
        auxiliaryData: { blob: Buffer.from(metadata.to_bytes()).toString('hex') }
      };
  }
  return request;
}

function formatTrezorWithdrawals(
  withdrawals: RustModule.WalletV4.Withdrawals,
  path: Array<Array<number>>,
): Array<CardanoWithdrawal> {
  const result = [];

  const withdrawalKeys = withdrawals.keys();
  for (let i = 0; i < withdrawalKeys.len(); i++) {
    const withdrawalAmount = withdrawals.get(withdrawalKeys.get(i));
    if (withdrawalAmount == null) {
      throw new Error(`${nameof(formatTrezorWithdrawals)} should never happen`);
    }
    result.push({
      amount: withdrawalAmount.to_str(),
      path: path[i],
    });
  }
  return result;
}
function formatTrezorCertificates(
  certificates: RustModule.WalletV4.Certificates,
  path: Array<Array<number>>,
): Array<CardanoCertificate> {
  const result = [];
  for (let i = 0; i < certificates.len(); i++) {
    const cert = certificates.get(i);
    if (cert.as_stake_registration() != null) {
      result.push({
        type: CERTIFICATE_TYPE.StakeRegistration,
        path: path[i],
      });
      continue;
    }
    if (cert.as_stake_deregistration() != null) {
      result.push({
        type: CERTIFICATE_TYPE.StakeDeregistration,
        path: path[i],
      });
      continue;
    }
    const delegationCert = cert.as_stake_delegation();
    if (delegationCert != null) {
      result.push({
        type: CERTIFICATE_TYPE.StakeDelegation,
        path: path[i],
        pool: Buffer.from(delegationCert.pool_keyhash().to_bytes()).toString('hex'),
      });
      continue;
    }
    throw new Error(`${nameof(formatTrezorCertificates)} Trezor doesn't support this certificate type`);
  }
  return result;
}

/**
 * Canonical inputs sorting: by tx hash and then by index
 */
function compareInputs(a: CardanoInput, b: CardanoInput): number {
  if (a.prev_hash !== b.prev_hash) {
    return a.prev_hash < b.prev_hash ? -1 : 1;
  }
  return a.prev_index - b.prev_index;
}

function _transformToTrezorInputs(
  inputs: Array<CardanoAddressedUtxo>
): Array<CardanoInput> {
  for (const input of inputs) {
    verifyFromBip44Root(input.addressing);
  }
  return inputs.map(input => ({
    prev_hash: input.tx_hash,
    prev_index: input.tx_index,
    path: toDerivationPathString(input.addressing.path),
  })).sort(compareInputs);
}

function toTrezorTokenBundle(
  assets: ?RustModule.WalletV4.MultiAsset
): {|
  tokenBundle?: Array<CardanoAssetGroup>,
|} {
  if (assets == null) return Object.freeze({});

  const assetGroup: Array<CardanoAssetGroup> = [];
  const policyHashes = assets.keys();
  for (let i = 0; i < policyHashes.len(); i++) {
    const policyId = policyHashes.get(i);
    const assetsForPolicy = assets.get(policyId);
    if (assetsForPolicy == null) continue;

    const tokenAmounts: Array<CardanoToken> = [];
    const assetNames = assetsForPolicy.keys();
    for (let j = 0; j < assetNames.len(); j++) {
      const assetName = assetNames.get(j);
      const amount = assetsForPolicy.get(assetName);
      if (amount == null) continue;

      tokenAmounts.push({
        amount: amount.to_str(),
        assetNameBytes: Buffer.from(assetName.name()).toString('hex'),
      });
    }
    assetGroup.push({
      policyId: Buffer.from(policyId.to_bytes()).toString('hex'),
      tokenAmounts,
    });
  }
  return { tokenBundle: assetGroup };
}
function _generateTrezorOutputs(
  txOutputs: RustModule.WalletV4.TransactionOutputs,
  changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
  stakingKeyPath: Array<number>,
): Array<CardanoOutput> {
  const result = [];
  for (let i = 0; i < txOutputs.len(); i++) {
    const output = txOutputs.get(i);
    const address = output.address();
    const jsAddr = toHexOrBase58(output.address());

    const tokenBundle = toTrezorTokenBundle(output.amount().multiasset());

    const changeAddr = changeAddrs.find(change => jsAddr === change.address);
    if (changeAddr != null) {
      verifyFromBip44Root(changeAddr.addressing);
      if (RustModule.WalletV4.BaseAddress.from_address(address)) {
        result.push({
          addressParameters: {
            addressType: ADDRESS_TYPE.Base,
            path: changeAddr.addressing.path,
            stakingPath: stakingKeyPath,
          },
          amount: output.amount().coin().to_str(),
          ...tokenBundle
        });
      } else if (RustModule.WalletV4.ByronAddress.from_address(address)) {
        result.push({
          addressParameters: {
            addressType: ADDRESS_TYPE.Byron,
            path: changeAddr.addressing.path,
          },
          amount: output.amount().coin().to_str(),
        });
      } else {
        throw new Error('unexpected change address type');
      }
    } else {
      const byronWasm = RustModule.WalletV4.ByronAddress.from_address(address);
      result.push({
        address: byronWasm == null
          ? address.to_bech32()
          : byronWasm.to_base58(),
        amount: output.amount().coin().to_str(),
        ...tokenBundle,
      });
    }
  }
  return result;
}

export function toTrezorAddressParameters(
  address: RustModule.WalletV4.Address,
  path: Array<number>,
): CardanoAddressParameters {
  {
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(address);
    if (byronAddr) {
      return {
        addressType: ADDRESS_TYPE.Byron,
        path: toDerivationPathString(path),
      };
    }
  }
  {
    const baseAddr = RustModule.WalletV4.BaseAddress.from_address(address);
    if (baseAddr) {
      const stakeCred = baseAddr.stake_cred();
      const hash = stakeCred.to_keyhash() ?? stakeCred.to_scripthash();
      if (hash == null) {
        throw new Error(`${nameof(toTrezorAddressParameters)} unknown hash type`);
      }
      return {
        addressType: ADDRESS_TYPE.Base,
        path: toDerivationPathString(path),
        // can't always know staking key path since address may not belong to the wallet
        // (mangled address)
        stakingKeyHash: Buffer.from(hash.to_bytes()).toString('hex'),
      };
    }
  }
  {
    const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(address);
    if (ptrAddr) {
      const pointer = ptrAddr.stake_pointer();
      return {
        addressType: ADDRESS_TYPE.Pointer,
        path: toDerivationPathString(path),
        certificatePointer: {
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
        addressType: ADDRESS_TYPE.Enterprise,
        path: toDerivationPathString(path),
      };
    }
  }
  {
    const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(address);
    if (rewardAddr) {
      return {
        addressType: ADDRESS_TYPE.Reward,
        path: toDerivationPathString(path),
      };
    }
  }
  throw new Error(`${nameof(toTrezorAddressParameters)} unknown address type`);
}

export function buildSignedTransaction(
  txBody: RustModule.WalletV4.TransactionBody,
  senderUtxos: Array<CardanoAddressedUtxo>,
  witnesses: Array<CardanoSignedTxWitness>,
  publicKey: {|
    ...Addressing,
    key: RustModule.WalletV4.Bip32PublicKey,
  |},
  stakingKey: ?RustModule.WalletV4.Bip32PublicKey,
  metadata: RustModule.WalletV4.AuxiliaryData | void,
): RustModule.WalletV4.Transaction {
  const findWitness = (pubKey: string) => {
    for (const witness of witnesses) {
      if (witness.pubKey === pubKey) {
        return witness.signature;
      }
    }
    throw new Error(`${nameof(buildSignedTransaction)} no witness for ${pubKey}`);
  };

  const keyLevel = publicKey.addressing.startLevel + publicKey.addressing.path.length - 1;

  const witSet = RustModule.WalletV4.TransactionWitnessSet.new();
  const bootstrapWitnesses: Array<RustModule.WalletV4.BootstrapWitness> = [];
  const vkeys: Array<RustModule.WalletV4.Vkeywitness> = [];

  const seenVKeyWit = new Set<string>();
  const seenBootstrapWit = new Set<string>();

  for (const utxo of senderUtxos) {
    verifyFromBip44Root(utxo.addressing);

    const addressKey = derivePublicByAddressing({
      addressing: utxo.addressing,
      startingFrom: {
        level: keyLevel,
        key: publicKey.key,
      }
    });
    const pubKey = Buffer.from(addressKey.to_raw_key().as_bytes()).toString('hex');

    const witness = findWitness(pubKey);

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
  const stakingPubKey = stakingKey
    ? Buffer.from(stakingKey.to_raw_key().as_bytes()).toString('hex')
    : null;

  for (const witness of witnesses) {
    if (witness.pubKey === stakingPubKey) {
      if (stakingKey == null) {
        throw new Error('unexpected nullish staking key');
      }
      const vkeyWit = RustModule.WalletV4.Vkeywitness.new(
        RustModule.WalletV4.Vkey.new(stakingKey.to_raw_key()),
        RustModule.WalletV4.Ed25519Signature.from_bytes(Buffer.from(witness.signature, 'hex')),
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

type AddressMap = { [addressHex: string]: Array<number> };

// Convert connector sign tx input into request to Trezor.
// Note this function has some overlaps in functionality with above functions but
// this function is more generic because above functions deal only with Yoroi
// extension "send" transactions.
export function toTrezorSignRequest(
  txBody: RustModule.WalletV4.TransactionBody,
  networkId: number,
  protocolMagic: number,
  ownUtxoAddressMap: AddressMap,
  ownStakeAddressMap: AddressMap,
  addressedUtxos: Array<CardanoAddressedUtxo>,
): $Exact<CardanoSignTransaction> {
  function formatInputs(inputs: RustModule.WalletV4.TransactionInputs): Array<CardanoInput> {
    const formatted = [];
    for (let i = 0; i < inputs.len(); i++) {
      const input = inputs.get(i);
      const hash = input.transaction_id().to_hex();
      const index = input.index();
      const ownUtxo = addressedUtxos.find(utxo =>
        utxo.tx_hash === hash && utxo.tx_index === index
      );
      formatted.push({
        prev_hash: hash,
        prev_index: index,
        ...(ownUtxo ? { path: ownUtxo.addressing.path } : {})
      });
    }
    return formatted.sort(compareInputs);
  }

  function formatOutput(output: RustModule.WalletV4.TransactionOutput): CardanoOutput {
    const amount =  output.amount().coin().to_str();
    const tokenBundle = toTrezorTokenBundle(output.amount().multiasset());
    const outputDataHash = output.data_hash();
    const datumHash = outputDataHash ? { datumHash: outputDataHash.to_hex() } : {};

    const addr = output.address();
    let result;
    // Yoroi doesn't have Byron addresses or pointer addresses.
    // If the address is one of these, it's not a wallet address.
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(addr);
    const pointerAddr = RustModule.WalletV4.PointerAddress.from_address(addr);
    if (byronAddr || pointerAddr) {
      result = {
        address: addr.to_bech32(),
        amount,
        ...tokenBundle,
        ...datumHash,
      };
    }

    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(addr);
    if (enterpriseAddr) {
      const ownAddressPath = ownUtxoAddressMap[addr.to_bech32()];
      if (ownAddressPath) {
        result = {
          addressParameters: {
            addressType: ADDRESS_TYPE.Enterprise,
            path: ownAddressPath,
          },
          amount,
          ...tokenBundle,
          ...datumHash,
        };
      } else {
        result = {
          address: addr.to_bech32(),
          amount,
          ...tokenBundle,
          ...datumHash,
        };
      }
    }

    const baseAddr = RustModule.WalletV4.BaseAddress.from_address(addr);
    if (baseAddr) {
      const paymentAddress = RustModule.WalletV4.EnterpriseAddress.new(
        networkId,
        baseAddr.payment_cred()
      ).to_address().to_hex();
      const ownPaymentPath = ownUtxoAddressMap[paymentAddress];
      if (ownPaymentPath) {
        const stake = baseAddr.stake_cred();
        const stakeAddr = RustModule.WalletV4.RewardAddress.new(
          networkId,
          stake,
        ).to_address().to_hex();
        const ownStakePath = ownStakeAddressMap[stakeAddr];
        if (ownStakePath) {
          // stake address is ours
          result = {
            addressParameters: {
              addressType: ADDRESS_TYPE.Base,
              path: ownPaymentPath,
              stakingPath: ownStakePath,
            },
            amount,
            ...tokenBundle,
            ...datumHash,
          };
        } else {
          const keyHash = stake.to_keyhash();
          const scriptHash = stake.to_scripthash();
          if (keyHash) {
            // stake address is foreign key hash
            result = {
              addressParameters: {
                addressType: ADDRESS_TYPE.Base,
                path: ownPaymentPath,
                stakingKeyHas: keyHash.to_hex(),
              },
              amount,
              ...tokenBundle,
              ...datumHash,
            };
          } else if (scriptHash) {
            // stake address is script hash
            result = {
              addressParameters: {
                addressType: ADDRESS_TYPE.Base,
                path: ownPaymentPath,
                stakingScriptHash: scriptHash.to_hex(),
              },
              amount,
              ...tokenBundle,
              ...datumHash,
            };
          } else {
            throw new Error('unexpected stake credential type in base address');
          }
        }
        // not having BASE_PAYMENT_SCRIPT_ because payment script is
        // treated as third party address
      } else { // payment address is not ours
        result = {
          address: addr.to_bech32(),
          amount,
          ...tokenBundle,
          ...datumHash,
        };
      }
    }

    // we do not allow payment to RewardAddresses
    if (!result) {
      throw new Error('not expecting to pay to reward address');
    }

    return result;
  }

  const outputs = [];
  for (let i = 0; i < txBody.outputs().len(); i++) {
    outputs.push(formatOutput(txBody.outputs().get(i)));
  }

  const formattedRequiredSigners = [];
  const additionalWitnessRequests = [];
  const requiredSigners = txBody.required_signers();
  if (requiredSigners) {
    for (let i = 0; i < requiredSigners.len(); i++) {
      const hash = requiredSigners.get(i);
      const address = RustModule.WalletV4.EnterpriseAddress.new(
        networkId,
        RustModule.WalletV4.StakeCredential.from_keyhash(hash),
      ).to_address().to_hex();
      const ownAddressPath = ownUtxoAddressMap[address];
      if (ownAddressPath) {
        formattedRequiredSigners.push({
          keyPath: ownAddressPath,
        });
        additionalWitnessRequests.push(ownAddressPath);
      } else {
        formattedRequiredSigners.push({
          keyHash: hash.to_hex(),
        });
      }
    }
  }

  let formattedCertificates = null;
  const certificates = txBody.certs();
  if (certificates) {
    const getPath = (
      stakeCredential: RustModule.WalletV4.StakeCredential
    ): Array<number> => {
      const rewardAddr = RustModule.WalletV4.RewardAddress.new(
        networkId,
        stakeCredential
      );
      const addressPayload = Buffer.from(rewardAddr.to_address().to_bytes()).toString('hex');
      const addressing = ownStakeAddressMap[addressPayload];
      if (addressing == null) {
        throw new Error('not own address in certificate');
      }
      return addressing;
    };

    const result = [];
    for (let i = 0; i < certificates.len(); i++) {
      const cert = certificates.get(i);

      const registrationCert = cert.as_stake_registration();
      if (registrationCert != null) {
        result.push({
          type: CERTIFICATE_TYPE.StakeRegistration,
          path: getPath(registrationCert.stake_credential()),
        });
        continue;
      }
      const deregistrationCert = cert.as_stake_deregistration();
      if (deregistrationCert != null) {
        result.push({
          type: CERTIFICATE_TYPE.StakeDeregistration,
          path: getPath(deregistrationCert.stake_credential()),
        });
        continue;
      }
      const delegationCert = cert.as_stake_delegation();
      if (delegationCert != null) {
        result.push({
          type: CERTIFICATE_TYPE.StakeDelegation,
          path: getPath(delegationCert.stake_credential()),
          pool: delegationCert.pool_keyhash().to_hex(),
        });
        continue;
      }
      throw new Error(`unsupported certificate type`);
    }
    formattedCertificates = result;
  }

  let formattedWithdrawals = null;
  const withdrawals = txBody.withdrawals();
  if (withdrawals) {
    const result = [];

    const withdrawalKeys = withdrawals.keys();
    for (let i = 0; i < withdrawalKeys.len(); i++) {
      const rewardAddress = withdrawalKeys.get(i);
      const withdrawalAmount = withdrawals.get(rewardAddress);
      if (withdrawalAmount == null) {
        throw new Error('missing withdraw amount should never happen');
      }

      const rewardAddressPayload = rewardAddress.to_address().to_hex();
      const path = ownStakeAddressMap[rewardAddressPayload];
      if (path == null) {
        throw new Error('foreign withdrawal reward address');
      }
      result.push({
        amount: withdrawalAmount.to_str(),
        path,
      });
    }
    formattedWithdrawals = result;
  }

  // TODO: support CIP36 aux data
  let formattedAuxiliaryData = null;
  const auxiliaryDataHash = txBody.auxiliary_data_hash();
  if (auxiliaryDataHash) {
    formattedAuxiliaryData = {
      hash: auxiliaryDataHash.to_hex(),
    };
  }

  let formattedCollateral = null;
  const collateral = txBody.collateral();
  if (collateral) {
    // eslint-disable-next-line no-unused-vars
    formattedCollateral = formatInputs(collateral);
  }

  let formattedReferenceInputs = null;
  const referenceInputs = txBody.reference_inputs();
  if (referenceInputs) {
    // eslint-disable-next-line no-unused-vars
    formattedReferenceInputs = formatInputs(referenceInputs);
  }

  const validityIntervalStart = txBody.validity_start_interval_bignum()?.to_str() ?? null;
  // temp workaround for buggy Mint.to_js_value()
  const formattedMint = JSON.parse(txBody.mint()?.to_json() ?? 'null')?.map(([policyId, assets]) => ({
    policyId,
    tokenAmounts: Object.keys(assets).map(assetNameBytes => (
      { assetNameBytes, mintAmount: assets[assetNameBytes] }
    )),
  }));

  const scriptDataHash = txBody.script_data_hash()?.to_hex();

  const result: $Exact<CardanoSignTransaction> = {
    signingMode: CardanoTxSigningMode.ORDINARY_TRANSACTION,
    inputs: formatInputs(txBody.inputs()),
    outputs,
    fee: txBody.fee().to_str(),
    protocolMagic,
    networkId,
    includeNetworkId: txBody.network_id() != null,
  };

  if (txBody.ttl()) {
    result.ttl = String(txBody.ttl());
  }
  if (validityIntervalStart) {
    result.validityIntervalStart = validityIntervalStart;
  }
  if (formattedCertificates) {
    result.certificates = formattedCertificates;
  }
  if (formattedWithdrawals) {
    result.withdrawals = formattedWithdrawals;
  }
  if (formattedAuxiliaryData) {
    result.auxiliaryData = formattedAuxiliaryData;
  }
  if (formattedMint) {
    result.mint = formattedMint;
  }
  if (scriptDataHash) {
    result.scriptDataHash = scriptDataHash;
  }
  if (formattedCollateral) {
    result.collateralInputs = formattedCollateral;
  }
  if (requiredSigners) {
    result.requiredSigners = formattedRequiredSigners;
  }

  if (additionalWitnessRequests.length > 0) {
    result.additionalWitnessRequests = additionalWitnessRequests;
  }

  console.log('Trezor sign request:', JSON.stringify(result, null, 2));
  return result;
}

export function buildConnectorSignedTransaction(
  txBody: RustModule.WalletV4.TransactionBody,
  witnesses: Array<CardanoSignedTxWitness>,
  metadata: RustModule.WalletV4.AuxiliaryData | void,
): RustModule.WalletV4.Transaction {
  const vkeyWitnesses = RustModule.WalletV4.Vkeywitnesses.new();
  for (const witness of witnesses) {
    if (witness.type === CardanoTxWitnessType.BYRON_WITNESS) {
      throw new Error('Byron wallet does not support connector API');
    } else if (witness.type === CardanoTxWitnessType.SHELLEY_WITNESS) {
      const vkeyWitness = RustModule.WalletV4.Vkeywitness.new(
        RustModule.WalletV4.Vkey.new(
          RustModule.WalletV4.PublicKey.from_hex(witness.pubKey)
        ),
        RustModule.WalletV4.Ed25519Signature.from_hex(witness.signature),
      );
      vkeyWitnesses.add(vkeyWitness);
    } else {
      throw new Error('unexpected witness type');
    }
  }
  const witnessSet = RustModule.WalletV4.TransactionWitnessSet.new();
  witnessSet.set_vkeys(vkeyWitnesses);
  return RustModule.WalletV4.Transaction.new(
    txBody,
    witnessSet,
    metadata
  );
}
