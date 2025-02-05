// @flow
import type { CardanoAddressedUtxo, } from '../types';
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
} from 'trezor-connect-flow/index';
import {
  CardanoAddressType,
  CardanoCertificateType,
  CardanoGovernanceRegistrationFormat,
  CardanoTxOutputSerializationFormat,
  CardanoTxSigningMode,
  CardanoTxWitnessType,
  CardanoDRepType,
} from 'trezor-connect-flow';
import type { Addressing, Address, Value } from '../../lib/storage/models/PublicDeriver/interfaces';
import type { TrezorTCatalystRegistrationTxSignData } from './HaskellShelleyTxSignRequest';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { bytesToHex, iterateLenGet, iterateLenGetMap, forceNonNull, hexToBytes } from '../../../../coreUtils';
import { transactionHexToHash } from '../../lib/cardanoCrypto/utils';

// ==================== TREZOR ==================== //

function formatTrezorCertificates(
  certificates: RustModule.WalletV4.Certificates,
  getPath: (stakeCredential: RustModule.WalletV4.Credential) => Array<number>,
): Array<CardanoCertificate> {
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
    const voteDelegation = cert.as_vote_delegation();
    if (voteDelegation != null) {
      const wasmDrep = voteDelegation.drep();
      let dRep;
      switch (wasmDrep.kind()) {
      case RustModule.WalletV4.DRepKind.KeyHash:
        dRep = {
          type: CardanoDRepType.KEY_HASH,
          keyHash: forceNonNull(voteDelegation.drep().to_key_hash()).to_hex(),
        };
        break;
      case RustModule.WalletV4.DRepKind.ScriptHash:
        dRep = {
          type: CardanoDRepType.SCRIPT_HASH,
          scriptHash: forceNonNull(voteDelegation.drep().to_script_hash()).to_hex(),
        };
        break;
      case RustModule.WalletV4.DRepKind.AlwaysAbstain:
        dRep = {
          type: CardanoDRepType.ABSTAIN,
        };
        break;
      case RustModule.WalletV4.DRepKind.AlwaysNoConfidence:
        dRep = {
          type: CardanoDRepType.NO_CONFIDENCE,
        };
        break;
      default:
        throw new Error('Trezor: Unsupported dRep kind: ' + wasmDrep.kind());
      }
      result.push({
        type: CardanoCertificateType.VOTE_DELEGATION,
        dRep,
        path: getPath(voteDelegation.stake_credential()),
      });
      continue;
    }
    // TODO: @trezor/connect-web 9.4.2 hasn't supported dRep (de)registration and update
    throw new Error(`${nameof(formatTrezorCertificates)} Trezor doesn't support this certificate type`);
  }
  return result;
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
  // when sending money, `ownAddressMap` doesn't contain the change address, so we need to
  // pass it in explicitly
  changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
  senderUtxos: Array<CardanoAddressedUtxo>,
  catalystData?: TrezorTCatalystRegistrationTxSignData,
): $Exact<CardanoSignTransaction> {

  const tagsState = RustModule.WasmScope(Module => Module.WalletV4.has_transaction_set_tag(
    Module.WalletV4.FixedTransaction.new_from_body_bytes(hexToBytes(txBodyHex)).to_bytes()
  ));

  if (tagsState === RustModule.WalletV4.TransactionSetsState.MixedSets) {
    throw new Error('Transaction with mixed sets cannot be signed by Ledger');
  }

  const txHasSetTags = tagsState === RustModule.WalletV4.TransactionSetsState.AllSetsHaveTag;

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
    formattedCertificates = formatTrezorCertificates(certificates, getPath);
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

  let formattedAuxiliaryData = null;
  const auxiliaryDataHash = txBody.auxiliary_data_hash();
  if (auxiliaryDataHash) {
    formattedAuxiliaryData = {
      hash: auxiliaryDataHash.to_hex(),
    };
  }

  // note: we know that `catelystData` is only used for voting in the extension and there
  // should be no other auxiliary data in this scenario so we just overwrite the auxiliary data
  if (catalystData) {
    const { votingPublicKey, nonce, paymentKeyPath, stakingKeyPath } = catalystData;
    formattedAuxiliaryData = {
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
  if (txHasSetTags) {
    result.tagCborSets = true;
  }

  if (formattedCollateral || referenceInputs) {
    result.signingMode = CardanoTxSigningMode.PLUTUS_TRANSACTION;
  }
  return result;
}

export function buildConnectorSignedTransaction(
  rawTxHex: string,
  witnesses: Array<CardanoSignedTxWitness>,
  metadata: ?RustModule.WalletV4.AuxiliaryData,
): {| txHex: string, txId: string |} {

  const fixedTx = RustModule.WalletV4.FixedTransaction.from_hex(rawTxHex);
  if (metadata) {
    fixedTx.set_auxiliary_data(metadata.to_bytes());
    const body = fixedTx.body();
    body.set_auxiliary_data_hash(RustModule.WalletV4.hash_auxiliary_data(metadata));
    fixedTx.set_body(body.to_bytes());
  }

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


  const txHex = fixedTx.to_hex();
  return { txHex, txId: transactionHexToHash(txHex)};
}
