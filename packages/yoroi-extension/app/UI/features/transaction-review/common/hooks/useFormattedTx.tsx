// import { usePortfolioTokenInfos } from '../../../Portfolio/common/hooks/usePortfolioTokenInfos';
// import { useSelectedNetwork } from '../../../WalletManager/common/hooks/useSelectedNetwork';
import { CredKind } from '@emurgo/cross-csl-core';
import { isNonNullable } from '@yoroi/common';
import { RustModule } from '../../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { deriveRewardAddressFromAddress } from '../../../../utils/common';
import { asQuantity } from '../../../../utils/createCurrentWalletInfo';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { FormattedTx, TransactionBody, TransactionInputs } from '../types';
import { TransactionOutputsJSON } from '@emurgo/cardano-serialization-lib-nodejs';

export const useFormattedTx = (data: TransactionBody): FormattedTx => {
  const { walletUtxos, walletAddresses, primaryTokenInfo, allAssetList, networkId } = useTxReviewModal();

  const inputs = data?.inputs ?? [];
  const outputs = data?.outputs ?? [];
  // const collateral = data?.collateral ?? [];
  const referenceInputs = data?.reference_inputs ?? [];

  const inputUtxos = getAllUtxos(inputs, walletUtxos);

  // TODO: collateral utxos are not used in tx details for now, but maybe should be in the future
  // const collateralUtxos = getAllUtxos(collateral, walletUtxos);

  const formattedFee = formatFee(primaryTokenInfo, data);

  const referenceInputUtxos = getAllUtxos(referenceInputs, walletUtxos);
  const formattedCertificates = formatCertificates(data?.certs);

  const formattedInputs = formatInputs(inputUtxos, allAssetList, networkId, primaryTokenInfo, walletAddresses);
  const formattedOutputs = formatOutputs(outputs, allAssetList, networkId, primaryTokenInfo, walletAddresses);

  return {
    inputs: formattedInputs,
    outputs: formattedOutputs,
    fee: formattedFee,
    certificates: formattedCertificates,
    referenceInputs: referenceInputUtxos,
  };
};

const formatInputs = (inputUtxos, allAssetList, networkId, primaryTokenInfo, walletAddresses): any => {
  return inputUtxos.map((utxo) => {

    const address = utxo?.receiver;
    const { resolvedAddress, paymentCredKind } = resolveAddress(address);

    const rewardAddress = address !== null && paymentCredKind === CredKind.Key ? deriveAddress(address, networkId) : null;
    const isOwnAddress = address != null ? isOwnedAddress(walletAddresses, address) : null;

    const assets = (utxo.assets??[]).map(asset => {
      const tokenDetails = allAssetList.find(a => a.info.id === asset.Token?.Identifier);
      const amount = asset.TokenList?.Amount;
      if (tokenDetails == null || amount == null) {
        return null
      }
      const tokenInfo = tokenDetails.info.id === '' ? primaryTokenInfo : tokenDetails;
      return { tokenInfo, quantity: asQuantity(amount) }
    }).filter(isNonNullable)

    return {
      assets,
      address: resolvedAddress,
      addressKind: paymentCredKind,
      rewardAddress,
      ownAddress: isOwnAddress,
      txIndex: utxo.tx_index,
      txHash: utxo.tx_hash,
    };
  });
};

const formatOutputs = (
  outputs: TransactionOutputsJSON,
  allAssetList: any,
  networkId: number,
  primaryTokenInfo: any,
  walletAddresses: any,
): any => {
  return outputs.map(output => {
    const address = output.address;
    const coin: any = output.amount.coin;

    const { resolvedAddress, paymentCredKind } = resolveAddress(address);

    const rewardAddress = paymentCredKind === CredKind.Key ? deriveAddress(address, networkId) : null;
    const primaryAssets = [
      {
        tokenInfo: primaryTokenInfo,
        quantity: asQuantity(coin.toString()),
      },
    ];

    const multiAssets = Object.entries(output.amount.multiasset ?? []).flatMap(([policyId, assets]: any) => {
      return Object.entries(assets).map(([assetId, amount]) => {
        const tokenInfo: any = allAssetList?.find(asset => asset.info.id === `${policyId}.${assetId}`);
        if (tokenInfo == null) return null;
        const quantity: any = asQuantity(String(amount));
        return {tokenInfo, quantity};
      });
    });
    const assets = [...primaryAssets, ...multiAssets];

    return {
      assets,
      address: resolvedAddress,
      addressKind: paymentCredKind,
      rewardAddress,
      ownAddress: address != null ? isOwnedAddress(walletAddresses, address) : null,
    };
  });
};

export const formatFee = (primaryTokenInfo: any, data: TransactionBody): any => {
  return {
    tokenInfo: primaryTokenInfo,
    quantity: asQuantity(data?.fee ?? '0'),
    rawQuantity: asQuantity(data?.fee ?? '0'),
  };
};

const deriveAddress = (address: string, networkId: number) => {
  try {
    return deriveRewardAddressFromAddress(address, networkId);
  } catch (e) {
    console.error('Failed to derive reward address from: ' + address, e);
    return null;
  }
};

const resolveAddress = (addressBech32: string | undefined): {
  resolvedAddress: string | undefined,
  paymentCredKind: number | null,
} => {
  if (addressBech32 == null) {
    return { resolvedAddress: addressBech32, paymentCredKind: null };
  }
  const address = RustModule.WalletV4.Address.from_bech32(addressBech32);
  if (address.kind() === RustModule.WalletV4.AddressKind.Byron) {
    return {
      resolvedAddress: RustModule.WalletV4.ByronAddress.from_address(address).to_base58(),
      paymentCredKind: null,
    };
  }
  return {
    resolvedAddress: addressBech32,
    paymentCredKind: address.payment_cred().kind() ?? null,
  };
}

export const getAllUtxos = (inputs: TransactionInputs, walletUtxos: any) => {
  // noinspection JSIncompatibleTypesComparison
  return inputs.filter(i => i != null)
    .map(input => getUtxo(walletUtxos, input.transaction_id, input.index)) ?? [];
};

const getUtxo = (utxos: any, txHash: string, txIndex: number) => {
  let internalUtxo = utxos.find(u => {
    return u.output.Transaction.Hash === txHash && u.output.UtxoTransactionOutput.OutputIndex === txIndex;
  });

  if (internalUtxo === undefined) {
    const hexAddr = RustModule.WalletV4.Address.from_hex(utxos[0].address).to_bech32();
    internalUtxo = {
      address: hexAddr,
      amount: utxos[0].output?.tokens[0].TokenList.Amount,
      assets: utxos[0].output?.tokens,
      tx_hash: utxos[0].output?.Transaction?.Hash,
      tx_index: utxos[0].output.UtxoTransactionOutput.OutputIndex,
      utxo_id: `${utxos[0].output?.Transaction?.Hash}:${utxos[0].output.UtxoTransactionOutput.OutputIndex}`,
    };
    return internalUtxo;
  }

  const hexAddr = RustModule.WalletV4.Address.from_hex(internalUtxo?.address).to_bech32();
  return {
    amount: internalUtxo.output?.tokens[0].TokenList.Amount,
    assets: internalUtxo.output?.tokens,
    receiver: hexAddr,
    tx_hash: internalUtxo.output.Transaction.Hash,
    tx_index: internalUtxo.output.UtxoTransactionOutput.OutputIndex,
    utxo_id: `${internalUtxo.output.Transaction.Hash}:${internalUtxo.output.UtxoTransactionOutput.OutputIndex}`,
  };
};

const isOwnedAddress = (walletAddresses: any[], bech32Address: string): boolean => {
  return walletAddresses.some(a => a === bech32Address);
};

const formatCertificates = (certificates: TransactionBody['certs']) => {
  return (
    certificates?.map(cert => {
      const entry = Object.entries(cert)[0];
      if (!entry) return null;
      const [type, certificate] = entry;
      return { type, value: certificate };
    }) ?? null
  );
};
