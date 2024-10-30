import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';
import { protocolParams } from './networkConfig.js';

export function bytesToHex(bytes) {
  return Buffer.from(bytes).toString('hex');
}

export function hexToBytes(hex) {
  return Buffer.from(hex, 'hex');
}

export function cslMultiassetToJSONs(cslMultiasset) {
  let assetValue = [];
  const cslScriptHashes = cslMultiasset?.keys();
  for (let i = 0; i < cslScriptHashes?.len(); i++) {
    const cslAssets = cslMultiasset.get(cslScriptHashes.get(i));
    const cslAssetNames = cslAssets.keys();
    const assetsJSON = {};
    for (let j = 0; j < cslAssetNames.len(); j++) {
      const cslAssetName = cslAssetNames.get(j);
      const policyId = bytesToHex(cslScriptHashes.get(i).to_bytes());
      const name = bytesToHex(cslAssetName.to_bytes());
      assetsJSON[`${policyId}.${name}`] = cslAssets.get(cslAssetName).to_str();
    }
    assetValue.push(assetsJSON);
  }
  return assetValue;
}

export const toInt = number => CSL.Int.new_i32(number);

export const getTxBuilder = () => {
  return CSL.TransactionBuilder.new(
    CSL.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        CSL.LinearFee.new(
          CSL.BigNum.from_str(protocolParams.linearFee.minFeeA),
          CSL.BigNum.from_str(protocolParams.linearFee.minFeeB)
        )
      )
      .pool_deposit(CSL.BigNum.from_str(protocolParams.poolDeposit))
      .key_deposit(CSL.BigNum.from_str(protocolParams.keyDeposit))
      .coins_per_utxo_byte(
        CSL.BigNum.from_str(
          Math.floor(parseFloat(protocolParams.coinsPerUtxoWord) / 8).toString(10)
        )
      )
      .max_value_size(protocolParams.maxValueSize)
      .max_tx_size(protocolParams.maxTxSize)
      .ex_unit_prices(
        CSL.ExUnitPrices.new(
          CSL.UnitInterval.new(CSL.BigNum.from_str('577'), CSL.BigNum.from_str('10000')),
          CSL.UnitInterval.new(CSL.BigNum.from_str('721'), CSL.BigNum.from_str('10000000'))
        )
      )
      .build()
  );
};

export const getCslUtxo = utxoHex => CSL.TransactionUnspentOutput.from_bytes(hexToBytes(utxoHex));

export const getCslUtxos = utxosHex => {
  const cslUtxos = CSL.TransactionUnspentOutputs.new();
  for (const utxoHex of utxosHex) {
    const cslUtxo = getCslUtxo(utxoHex);
    cslUtxos.add(cslUtxo);
  }

  return cslUtxos;
};

export const getCslValue = valueHex => CSL.Value.from_hex(valueHex);

export const getAmountInHex = amount => CSL.Value.new(CSL.BigNum.from_str(amount)).to_hex();

export const getLargestFirstMultiAsset = () => CSL.CoinSelectionStrategyCIP2.LargestFirstMultiAsset;

export const getTransactionOutput = (cslOutputAddress, buildTransactionInput) =>
  CSL.TransactionOutput.new(
    cslOutputAddress,
    CSL.Value.new(CSL.BigNum.from_str(buildTransactionInput.amount))
  );

export const getAddressFromBytes = changeAddress =>
  CSL.Address.from_bytes(hexToBytes(changeAddress));

export const getAddressFromBech32 = addressBech32 => CSL.Address.from_bech32(addressBech32);

export const getRewarKeyHashFromBech32 = rewardAddressBech32 =>
  CSL.RewardAddress.from_address(CSL.Address.from_bech32(rewardAddressBech32))
    .payment_cred()
    .to_keyhash()
    .to_hex();

export const getTransactionFromBytes = txHex => CSL.Transaction.from_bytes(hexToBytes(txHex));

export const getTransactionWitnessSetFromBytes = witnessHex =>
  CSL.TransactionWitnessSet.from_bytes(hexToBytes(witnessHex));

export const getSignedTransaction = (cslUnsignedTransaction, cslWitnessSet) =>
  CSL.Transaction.new(
    cslUnsignedTransaction.body(),
    cslWitnessSet,
    cslUnsignedTransaction.auxiliary_data()
  );

export const getPubKeyHash = usedAddress =>
  CSL.BaseAddress.from_address(usedAddress).payment_cred().to_keyhash();

export const getNativeScript = pubKeyHash =>
  CSL.NativeScript.new_script_pubkey(CSL.ScriptPubkey.new(pubKeyHash));

export const getTransactionOutputBuilder = cslChangeAddress =>
  CSL.TransactionOutputBuilder.new().with_address(cslChangeAddress).next();

export const getAssetName = assetNameString =>
  CSL.AssetName.new(Buffer.from(assetNameString, 'utf8'));

export const addressToCbor = address => bytesToHex(CSL.Address.from_bech32(address).to_bytes());

export const addressesFromCborIfNeeded = addresses =>
  addresses.map(a => CSL.Address.from_bytes(hexToBytes(a)).to_bech32());

const reduceWasmMultiAsset = (multiAsset, reducer, initValue) => {
  let result = initValue;
  if (multiAsset) {
    const policyIds = multiAsset.keys();
    for (let i = 0; i < policyIds.len(); i++) {
      const policyId = policyIds.get(i);
      const assets = multiAsset.get(policyId);
      if (assets) {
        const assetNames = assets.keys();
        for (let j = 0; j < assetNames.len(); j++) {
          const name = assetNames.get(j);
          const amount = assets.get(name);
          const policyIdHex = bytesToHex(policyId.to_bytes());
          const encodedName = bytesToHex(name.name());
          result = reducer(result, {
            policyId: policyIdHex,
            name: encodedName,
            amount: amount?.to_str(),
            assetId: `${policyIdHex}.${encodedName}`,
          });
        }
      }
    }
  }

  return result;
};

export const mapCborUtxos = cborUtxos => {
  const mappedUtxos = cborUtxos.map(hex => {
    const u = getCslUtxo(hex);
    const input = u.input();
    const output = u.output();
    const txHash = bytesToHex(input.transaction_id().to_bytes());
    const txIndex = input.index();
    const value = output.amount();
    return {
      utxo_id: `${txHash}${txIndex}`,
      tx_hash: txHash,
      tx_index: txIndex,
      receiver: output.address().to_bech32(),
      amount: value.coin().to_str(),
      assets: reduceWasmMultiAsset(
        value.multiasset(),
        (res, asset) => {
          res.push(asset);
          return res;
        },
        []
      ),
    };
  });

  return mappedUtxos;
};

export const signTxWithCSL = (unsignedTxHex, witnessHex) => {
  const cslUnsignedTransaction = getTransactionFromBytes(unsignedTxHex);
  const cslWitnessSet = getTransactionWitnessSetFromBytes(witnessHex);
  const cslSignedTransaction = getSignedTransaction(cslUnsignedTransaction, cslWitnessSet);

  return bytesToHex(cslSignedTransaction.to_bytes());
};

export const getCSLPubKeyHash = pubKey => CSL.PublicKey.from_hex(pubKey).hash();

export const getDRepIDHexAndBechFromHex = pubDRepKey => {
  const cslDRepIDHash = getCSLPubKeyHash(pubDRepKey);
  const dRepIDHex = cslDRepIDHash.to_hex();
  const dRepIDBech32 = cslDRepIDHash.to_bech32('drep');
  return {
    dRepIDHex,
    dRepIDBech32,
  };
};
