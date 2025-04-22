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
  const formattedOutputs = formatOutputs(outputs, networkId, primaryTokenInfo, walletAddresses, allAssetList);

  return {
    inputs: formattedInputs,
    outputs: formattedOutputs,
    fee: formattedFee,
    certificates: formattedCertificates,
    referenceInputs: referenceInputUtxos,
  };
};

const formatInputs = (inputUtxos, allAssetList, networkId, primaryTokenInfo, walletAddresses): any => {
  return Promise.all(
    inputUtxos.map(async (utxo, index) => {
      const address = utxo?.receiver;
      const coin = utxo?.amount != null ? asQuantity(utxo.amount) : null;

      const addressKind = address != null ? getAddressKind(address) : null;
      const rewardAddress = address !== null && addressKind === CredKind.Key ? deriveAddress(address, networkId) : null;
      const isOwnAddress = address != null ? isOwnedAddress(walletAddresses, address) : null;
      const primaryAssets =
        coin != null
          ? [
              {
                tokenInfo: primaryTokenInfo,
                quantity: coin,
              },
            ]
          : [];
      const multiAssets = allAssetList.map(a => {
        return {
          tokenInfo: a,
          quantity: a.quantity,
        };
      });

      return {
        assets: [...primaryAssets, ...(isOwnAddress !== null && index === 0 ? multiAssets : [])].filter(isNonNullable),
        address,
        addressKind,
        rewardAddress,
        ownAddress: isOwnAddress,
        txIndex: utxo.tx_index,
        txHash: utxo.tx_hash,
      };
    })
  );
};

const formatOutputs = (
  outputs: TransactionOutputsJSON,
  networkId: number,
  primaryTokenInfo: any,
  walletAddresses: any,
  allAssetList: any
): any => {
  return Promise.all(
    outputs.map(async output => {
      const address = output.address;
      const coin: any = output.amount.coin;

      const addressKind = getAddressKind(address);
      const rewardAddress = addressKind === CredKind.Key ? deriveAddress(address, networkId) : null;
      const primaryAssets = [
        {
          tokenInfo: primaryTokenInfo,
          quantity: asQuantity(coin.toString()),
        },
      ];

      const multiAssets = output.amount.multiasset
        ? Object.entries(output.amount.multiasset).flatMap(([policyId, assets]: any) => {
            return Object.entries(assets).map(([assetId, amount]) => {
              const tokenInfo: any = allAssetList.filter(asset => asset.info.id === `${policyId}.${assetId}`);
              if (tokenInfo == null) return null;
              const quantity: any = asQuantity(String(amount));

              return {
                tokenInfo: tokenInfo[0],
                quantity,
              };
            });
          })
        : [];
      const assets = [...primaryAssets, ...multiAssets];

      return {
        assets,
        address,
        addressKind,
        rewardAddress,
        ownAddress: address != null ? isOwnedAddress(walletAddresses, address) : null,
      };
    })
  );
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

const getAddressKind = (addressBech32: string): any => {
  try {
    const address = RustModule.WalletV4.Address.from_bech32(addressBech32);
    if (address.kind() === RustModule.WalletV4.AddressKind.Byron) {
      return null;
    }
    return address.payment_cred().kind() ?? null;
  } catch {
    return null;
  }
};

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
