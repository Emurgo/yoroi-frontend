// // @flow
import type { CardanoAddressedUtxo, } from '../types';
import { verifyFromDerivationRoot } from '../../lib/storage/models/utils';
import { toDerivationPathString } from '../../lib/cardanoCrypto/keys/path';
import type {
  CardanoAddressParameters,
  CardanoAssetGroup,
  CardanoCertificate,
  CardanoInput,
  CardanoOutput,
  CardanoSignedTxWitness,
  CardanoSignTransaction,
  CardanoToken,
  CardanoWithdrawal,
} from 'trezor-connect-flow/index';
import {
  CardanoAddressType,
  CardanoCertificateType,
  CardanoGovernanceRegistrationFormat,
  CardanoTxOutputSerializationFormat,
  CardanoTxSigningMode,
  CardanoTxWitnessType,
} from 'trezor-connect-flow';
import type { Address, Addressing, Value, } from '../../lib/storage/models/PublicDeriver/interfaces';
import { HaskellShelleyTxSignRequest } from './HaskellShelleyTxSignRequest';
import { Bip44DerivationLevels, } from '../../lib/storage/database/walletTypes/bip44/api/utils';
import { ChainDerivations, } from '../../../../config/numbersConfig';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { range } from 'lodash';
import { toHexOrBase58 } from '../../lib/storage/bridge/utils';
import blake2b from 'blake2b';
import { derivePublicByAddressing } from '../../lib/cardanoCrypto/deriveByAddressing';
import { bytesToHex, iterateLenGet, iterateLenGetMap, maybe } from '../../../../coreUtils';
import { mergeWitnessSets } from '../utils';

// ==================== TREZOR ==================== //
/** Generate a payload for Trezor SignTx */
export function createTrezorSignTxPayload(
  signRequest: HaskellShelleyTxSignRequest,
  byronNetworkMagic: number,
  networkId: number,
): $Exact<CardanoSignTransaction> {
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
    ttl: txBody.ttl_bignum()?.to_str(),
    validityIntervalStart: txBody.validity_start_interval_bignum()?.to_str(),
    scriptDataHash: txBody.script_data_hash()?.to_hex(),
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
    const { votingPublicKey, nonce, paymentKeyPath } =
      signRequest.trezorTCatalystRegistrationTxSignData;
    request = {
      ...request,
      auxiliaryData: {
        cVoteRegistrationParameters: {
          delegations: [
            {
              votePublicKey: votingPublicKey.replace(/^0x/, ''),
              weight: 1,
            }
          ],
          stakingPath: stakingKeyPath,
          paymentAddressParameters: {
            addressType: CardanoAddressType.BASE,
            path: paymentKeyPath,
            stakingPath: stakingKeyPath,
          },
          nonce: String(nonce),
          format: CardanoGovernanceRegistrationFormat.CIP36,
          votingPurpose: 0,
        },
      }
    };
  } else {
    const metadata = signRequest.metadata;
    request = metadata === undefined
      ? request
      : {
        ...request,
        auxiliaryData: {
          hash: blake2b(256 / 8).update(metadata.to_bytes()).digest('hex')
        }
      };
  }
  return request;
}

function formatTrezorWithdrawals(
  withdrawals: RustModule.WalletV4.Withdrawals,
  paths: Array<Array<number>>,
): Array<CardanoWithdrawal> {
  return iterateLenGetMap(withdrawals)
    .values()
    .nonNull()
    .zip(paths)
    .map(([withdrawalAmount, path]) => ({
      amount: withdrawalAmount.to_str(),
      path,
    }))
    .toArray();
}
function formatTrezorCertificates(
  certificates: RustModule.WalletV4.Certificates,
  paths: Array<Array<number>>,
): Array<CardanoCertificate> {
  const result = [];
  for (const [cert, path] of iterateLenGet(certificates).zip(paths)) {
    if (cert.as_stake_registration() != null) {
      result.push({
        type: CardanoCertificateType.STAKE_REGISTRATION,
        path,
      });
      continue;
    }
    if (cert.as_stake_deregistration() != null) {
      result.push({
        type: CardanoCertificateType.STAKE_DEREGISTRATION,
        path,
      });
      continue;
    }
    const delegationCert = cert.as_stake_delegation();
    if (delegationCert != null) {
      result.push({
        type: CardanoCertificateType.STAKE_DELEGATION,
        pool: delegationCert.pool_keyhash().to_hex(),
        path,
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
    verifyFromDerivationRoot(input.addressing);
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

  const tokenBundle: Array<CardanoAssetGroup> = iterateLenGetMap(assets)
    .nonNullValue()
    .map(([policyId, assetsForPolicy]) => {

      const tokenAmounts: Array<CardanoToken> = iterateLenGetMap(assetsForPolicy)
        .nonNullValue()
        .map(([assetName, amount]) => ({
          assetNameBytes: bytesToHex(assetName.name()),
          amount: amount.to_str(),
        }))
        .toArray();

      return {
        policyId: policyId.to_hex(),
        tokenAmounts,
      };

    })
    .toArray();

  return { tokenBundle };
}
function _generateTrezorOutputs(
  txOutputs: RustModule.WalletV4.TransactionOutputs,
  changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
  stakingKeyPath: Array<number>,
): Array<CardanoOutput> {
  const result = [];
  for (const output of iterateLenGet(txOutputs)) {
    const address = output.address();
    const jsAddr = toHexOrBase58(output.address());

    // <TODO:UPDATE> support post-alonzo map

    const tokenBundle = toTrezorTokenBundle(output.amount().multiasset());
    const dataHash = maybe(output.data_hash()?.to_hex(), datumHash => ({ datumHash })) ?? {};

    const changeAddr = changeAddrs.find(change => jsAddr === change.address);
    if (changeAddr != null) {
      verifyFromDerivationRoot(changeAddr.addressing);
      if (RustModule.WalletV4.BaseAddress.from_address(address)) {
        result.push({
          addressParameters: {
            addressType: CardanoAddressType.BASE,
            path: changeAddr.addressing.path,
            stakingPath: stakingKeyPath,
          },
          amount: output.amount().coin().to_str(),
          ...tokenBundle,
          ...dataHash,
        });
      } else if (RustModule.WalletV4.ByronAddress.from_address(address)) {
        result.push({
          addressParameters: {
            addressType: CardanoAddressType.BYRON,
            path: changeAddr.addressing.path,
          },
          amount: output.amount().coin().to_str(),
          ...dataHash,
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
        ...dataHash,
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
        addressType: CardanoAddressType.BYRON,
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
        addressType: CardanoAddressType.BASE,
        path: toDerivationPathString(path),
        // can't always know staking key path since address may not belong to the wallet
        // (mangled address)
        stakingKeyHash: hash.to_hex(),
      };
    }
  }
  {
    const ptrAddr = RustModule.WalletV4.PointerAddress.from_address(address);
    if (ptrAddr) {
      const pointer = ptrAddr.stake_pointer();
      return {
        addressType: CardanoAddressType.POINTER,
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
        addressType: CardanoAddressType.ENTERPRISE,
        path: toDerivationPathString(path),
      };
    }
  }
  {
    const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(address);
    if (rewardAddr) {
      return {
        addressType: CardanoAddressType.REWARD,
        path: toDerivationPathString(path),
      };
    }
  }
  throw new Error(`${nameof(toTrezorAddressParameters)} unknown address type`);
}

export function buildSignedTransaction(
  tx: RustModule.WalletV4.Transaction,
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
    verifyFromDerivationRoot(utxo.addressing);

    const addressKey = derivePublicByAddressing({
      addressing: utxo.addressing,
      startingFrom: {
        level: keyLevel,
        key: publicKey.key,
      }
    });
    const pubKey = addressKey.to_raw_key().to_hex();

    const witness = findWitness(pubKey);

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
  const stakingPubKey = stakingKey
    ? bytesToHex(stakingKey.to_raw_key().as_bytes())
    : null;

  for (const witness of witnesses) {
    if (witness.pubKey === stakingPubKey) {
      if (stakingKey == null) {
        throw new Error('unexpected nullish staking key');
      }
      const vkeyWit = RustModule.WalletV4.Vkeywitness.new(
        RustModule.WalletV4.Vkey.new(stakingKey.to_raw_key()),
        RustModule.WalletV4.Ed25519Signature.from_hex(witness.signature),
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
    mergeWitnessSets(tx.witness_set().to_hex(), witSet.to_hex()),
  );

  return RustModule.WalletV4.Transaction.new(
    tx.body(),
    mergedWitnessSet,
    metadata
  );
}

type AddressMap = (addressHex: string) => ?Array<number>;

// Convert connector sign tx input into request to Trezor.
// Note this function has some overlaps in functionality with above functions but
// this function is more generic because above functions deal only with Yoroi
// extension "send" transactions.
export function toTrezorSignRequest(
  txBodyHex: string,
  networkId: number,
  protocolMagic: number,
  ownAddressMap: AddressMap,
  senderUtxos: Array<CardanoAddressedUtxo>,
): $Exact<CardanoSignTransaction> {

  const txBody = RustModule.WalletV4.TransactionBody.from_hex(txBodyHex);

  function formatInputs(inputs: RustModule.WalletV4.TransactionInputs): Array<CardanoInput> {
    const formatted = [];
    for (const input of iterateLenGet(inputs)) {
      const hash = input.transaction_id().to_hex();
      const index = input.index();
      const ownUtxo = senderUtxos.find(utxo =>
        utxo.tx_hash === hash && utxo.tx_index === index
      );
      const cardanoInput: CardanoInput = {
        prev_hash: hash,
        prev_index: index,
      };
      if (ownUtxo) {
        cardanoInput.path = ownUtxo.addressing.path;
      }
      formatted.push(cardanoInput);
    }
    return formatted;
  }

  function formatOutput(
    output: RustModule.WalletV4.TransactionOutput,
  ): CardanoOutput {

    const isPostAlonzoTransactionOutput =
      output.serialization_format() === RustModule.WalletV4.CborContainerType.Map;

    const amount =  output.amount().coin().to_str();
    const { tokenBundle } = toTrezorTokenBundle(output.amount().multiasset());
    const outputDataHash = output.data_hash();

    const addr = output.address();
    let result;
    // Yoroi doesn't have Byron addresses or pointer addresses.
    // If the address is one of these, it's not a wallet address.
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(addr);
    const pointerAddr = RustModule.WalletV4.PointerAddress.from_address(addr);
    if (byronAddr || pointerAddr) {
      result = ({
        address: addr.to_bech32(),
        amount,
      }: CardanoOutput);
    }

    const enterpriseAddr = RustModule.WalletV4.EnterpriseAddress.from_address(addr);
    if (enterpriseAddr) {
      const ownAddressPath = ownAddressMap(addr.to_bech32());
      if (ownAddressPath) {
        result = ({
          addressParameters: {
            addressType: CardanoAddressType.ENTERPRISE,
            path: ownAddressPath,
          },
          amount,
        }: CardanoOutput);
      } else {
        result = ({
          address: addr.to_bech32(),
          amount,
        }: CardanoOutput);
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
          result = ({
            addressParameters: {
              addressType: CardanoAddressType.BASE,
              path: ownPaymentPath,
              stakingPath: ownStakePath,
            },
            amount,
          }: CardanoOutput);
        } else {
          const keyHash = stake.to_keyhash();
          const scriptHash = stake.to_scripthash();
          if (keyHash) {
            // stake address is foreign key hash
            result = ({
              addressParameters: {
                addressType: CardanoAddressType.BASE,
                path: ownPaymentPath,
                stakingKeyHash: keyHash.to_hex(),
              },
              amount,
            }: CardanoOutput);
          } else if (scriptHash) {
            // stake address is script hash
            result = ({
              addressParameters: {
                addressType: CardanoAddressType.BASE,
                path: ownPaymentPath,
                stakingScriptHash: scriptHash.to_hex(),
              },
              amount,
            }: CardanoOutput);
          } else {
            throw new Error('unexpected stake credential type in base address');
          }
        }
        // not having BASE_PAYMENT_SCRIPT_ because payment script is
        // treated as third party address
      } else { // payment address is not ours
        result = ({
          address: addr.to_bech32(),
          amount,
        }: CardanoOutput);
      }
    }

    // we do not allow payment to RewardAddresses
    if (!result) {
      throw new Error('not expecting to pay to reward address');
    }
    if (tokenBundle) {
      result.tokenBundle = tokenBundle;
    }
    if (outputDataHash) {
      result.datumHash = outputDataHash.to_hex();
    }

    if (isPostAlonzoTransactionOutput) {
      result.format = CardanoTxOutputSerializationFormat.MAP_BABBAGE;
    }

    const inlineDatum = output.plutus_data();
    if (inlineDatum) {
      result.inlineDatum = inlineDatum.to_hex();
      result.format = CardanoTxOutputSerializationFormat.MAP_BABBAGE;
    }

    const refScript = output.script_ref();
    if (refScript) {
      result.referenceScript = refScript.to_hex();
      result.format = CardanoTxOutputSerializationFormat.MAP_BABBAGE;
    }

    return result;
  }

  const outputs = iterateLenGet(txBody.outputs()).map(formatOutput).toArray();

  const formattedRequiredSigners = [];
  const additionalWitnessRequests = [];
  const requiredSigners = txBody.required_signers();
  if (requiredSigners) {
    for (const hash of iterateLenGet(requiredSigners)) {
      const enterpriseAddress = RustModule.WalletV4.EnterpriseAddress.new(
        networkId,
        RustModule.WalletV4.Credential.from_keyhash(hash),
      ).to_address().to_hex();
      const stakeAddress = RustModule.WalletV4.RewardAddress.new(
        networkId,
        RustModule.WalletV4.Credential.from_keyhash(hash),
      ).to_address().to_hex();
      const ownAddressPath = ownAddressMap(enterpriseAddress)
        || ownAddressMap(stakeAddress);
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
      stakeCredential: RustModule.WalletV4.Credential
    ): Array<number> => {
      const rewardAddr = RustModule.WalletV4.RewardAddress.new(
        networkId,
        stakeCredential
      );
      const addressPayload = rewardAddr.to_address().to_hex();
      const addressing = ownAddressMap(addressPayload);
      if (addressing == null) {
        throw new Error('not own address in certificate');
      }
      return addressing;
    };

    const result = [];
    for (const cert of iterateLenGet(certificates)) {
      const registrationCert = cert.as_stake_registration();
      if (registrationCert != null) {
        result.push({
          type: CardanoCertificateType.STAKE_REGISTRATION,
          path: getPath(registrationCert.stake_credential()),
        });
        continue;
      }
      const deregistrationCert = cert.as_stake_deregistration();
      if (deregistrationCert != null) {
        result.push({
          type: CardanoCertificateType.STAKE_DEREGISTRATION,
          path: getPath(deregistrationCert.stake_credential()),
        });
        continue;
      }
      const delegationCert = cert.as_stake_delegation();
      if (delegationCert != null) {
        result.push({
          type: CardanoCertificateType.STAKE_DELEGATION,
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

    for (const [rewardAddress, withdrawalAmount] of iterateLenGetMap(withdrawals).nonNullValue()) {
      const rewardAddressPayload = rewardAddress.to_address().to_hex();
      const path = ownAddressMap(rewardAddressPayload);
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

  const ttl = txBody.ttl_bignum()?.to_str();
  const validityIntervalStart = txBody.validity_start_interval_bignum()?.to_str();

  if (ttl) {
    result.ttl = ttl;
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
    result.signingMode = CardanoTxSigningMode.PLUTUS_TRANSACTION;
  }
  if (requiredSigners) {
    result.requiredSigners = formattedRequiredSigners;
  }
  const collateralReturn = txBody.collateral_return();
  if (collateralReturn) {
    result.collateralReturn = formatOutput(collateralReturn);
  }
  const totalCollateral = txBody.total_collateral();
  if (totalCollateral) {
    result.totalCollateral = totalCollateral.to_str();
  }
  const referenceInputs = txBody.reference_inputs();
  if (referenceInputs) {
    const formattedReferenceInputs = [];
    for (const input of iterateLenGet(referenceInputs)) {
      formattedReferenceInputs.push({
        prev_hash: input.transaction_id().to_hex(),
        prev_index: input.index(),
      });
    }
    result.referenceInputs = formattedReferenceInputs;
  }
  if (additionalWitnessRequests.length > 0) {
    result.additionalWitnessRequests = additionalWitnessRequests;
  }

  return result;
}

export function buildConnectorSignedTransaction(
  rawTxHex: string,
  witnesses: Array<CardanoSignedTxWitness>,
): string {

  const fixedTx = RustModule.WalletV4.FixedTransaction.from_hex(rawTxHex);

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

      fixedTx.add_vkey_witness(vkeyWitness);

    } else {
      throw new Error('unexpected witness type');
    }
  }


  return fixedTx.to_hex();
}
