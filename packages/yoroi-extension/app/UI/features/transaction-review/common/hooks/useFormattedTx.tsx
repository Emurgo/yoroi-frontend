// import { usePortfolioTokenInfos } from '../../../Portfolio/common/hooks/usePortfolioTokenInfos';
// import { useSelectedNetwork } from '../../../WalletManager/common/hooks/useSelectedNetwork';
import { CredKind } from '@emurgo/cross-csl-core';
import { isNonNullable } from '@yoroi/common';
import { Portfolio } from '@yoroi/types';
import { useQuery } from 'react-query';
import { RustModule } from '../../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { deriveRewardAddressFromAddress } from '../../../../utils/common';
import { asQuantity } from '../../../../utils/createCurrentWalletInfo';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { FormattedTx, TransactionBody, TransactionInputs } from '../types';

export const useFormattedTx = (data: TransactionBody, ftAssetsList: any, networkId, primaryTokenInfo): FormattedTx => {
  const { walletUtxos, walletAddresses } = useTxReviewModal();
  const inputs = data?.inputs ?? [];
  const outputs = data?.outputs ?? [];
  const referenceInputs = data?.reference_inputs ?? [];

  console.log('ftAssetsList', ftAssetsList);
  const inputUtxos = useUtxos(inputs, walletUtxos);
  const referenceInputUtxos = useUtxos(referenceInputs, walletUtxos);

  const formattedInputs = useFormattedInputs(inputUtxos, ftAssetsList, networkId, primaryTokenInfo, walletAddresses);

  console.log('=======@@@@@formattedInputs', formattedInputs);
  // return {
  //   inputs: formattedInputs,
  //   outputs: formattedOutputs,
  //   fee: formattedFee,
  //   certificates: formattedCertificates,
  //   mint: formattedMintData,
  //   referenceInputs: formattedReferenceInputs,
  // };
};

export const useFormattedInputs = (inputUtxos, ftAssetsList, networkId, primaryTokenInfo, walletAddresses) => {
  const query = useQuery<any>(
    ['useFormattedInputs', inputUtxos],
    async () => formatInputs(inputUtxos, ftAssetsList, networkId, primaryTokenInfo, walletAddresses),
    {
      suspense: true,
    }
  );

  if (!query.data) throw new Error('invalid formatted inputs');
  return query.data;
};

// export const useFormattedOutputs = (
//   wallet: any,
//   outputs: TransactionOutputs,
//   portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfos>
// ) => {
//   const query = useQuery<FormattedOutputs>(
//     ['useFormattedOutputs', outputs],
//     () => formatOutputs(wallet, outputs, portfolioTokenInfos),
//     {
//       suspense: true,
//     }
//   );

//   if (!query.data) throw new Error('invalid formatted outputs');
//   return query.data;
// };

const formatInputs = async (inputUtxos, ftAssetsList, networkId, primaryTokenInfo, walletAddresses): Promise<any> => {
  console.log('inputUtxos', inputUtxos);
  return Promise.all(
    inputUtxos.map(async utxo => {
      const address = utxo?.receiver;
      const coin = utxo?.amount != null ? asQuantity(utxo.amount) : null;

      const addressKind = address != null ? await getAddressKind(address) : null;
      const rewardAddress = address != null && addressKind === CredKind.Key ? await deriveAddress(address, networkId) : null;

      const primaryAssets =
        coin != null
          ? [
              {
                tokenInfo: primaryTokenInfo,
                quantity: coin,
              },
            ]
          : [];

      const multiAssets =
        utxo?.assets
          .map(a => {
            const tokenInfo = ftAssetsList.get(a?.assetId as Portfolio.Token.Id);
            if (!tokenInfo) return null;
            const quantity = asQuantity(a.amount);

            return {
              tokenInfo,
              quantity: quantity,
            };
          })
          .filter(Boolean) ?? [];

      return {
        assets: [...primaryAssets, ...multiAssets].filter(isNonNullable),
        address,
        addressKind: addressKind ?? null,
        rewardAddress,
        // ownAddress: false,
        ownAddress: address != null ? isOwnedAddress(walletAddresses, address) : null,
        txIndex: utxo.tx_index,
        txHash: utxo.tx_hash,
      };
    })
  );
};

// const formatOutputs = async (
//   wallet: any,
//   outputs: TransactionOutputs,
//   portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfos>
// ): Promise<FormattedOutputs> => {
//   return Promise.all(
//     outputs.map(async output => {
//       const address = output.address;
//       const coin = asQuantity(output.amount.coin);

//       const addressKind = await getAddressKind(address);
//       const rewardAddress = addressKind === CredKind.Key ? await deriveAddress(address, wallet.networkManager.chainId) : null;

//       const primaryAssets = [
//         {
//           tokenInfo: wallet.portfolioPrimaryTokenInfo,
//           name: wallet.portfolioPrimaryTokenInfo.name,
//           label: formatTokenWithText(coin, wallet.portfolioPrimaryTokenInfo),
//           quantity: coin,
//           isPrimary: true,
//         },
//       ];

//       const multiAssets = output.amount.multiasset
//         ? Object.entries(output.amount.multiasset).flatMap(([policyId, assets]) => {
//             return Object.entries(assets).map(([assetId, amount]) => {
//               const tokenInfo = portfolioTokenInfos.tokenInfos?.get(`${policyId}.${assetId}`);
//               if (tokenInfo == null) return null;
//               const quantity = asQuantity(amount);

//               return {
//                 tokenInfo,
//                 name: infoExtractName(tokenInfo),
//                 label: formatTokenWithText(quantity, tokenInfo),
//                 quantity,
//                 isPrimary: false,
//               };
//             });
//           })
//         : [];

//       const assets = [...primaryAssets, ...multiAssets].filter(isNonNullable);

//       return {
//         assets,
//         address,
//         addressKind,
//         rewardAddress,
//         ownAddress: isOwnedAddress(wallet, address),
//       };
//     })
//   );
// };

// export const formatFee = (wallet: any, data: TransactionBody): any => {
//   const fee = asQuantity(data?.fee ?? '0');

//   return {
//     tokenInfo: wallet.portfolioPrimaryTokenInfo,
//     name: wallet.portfolioPrimaryTokenInfo.name,
//     label: formatTokenWithText(fee, wallet.portfolioPrimaryTokenInfo),
//     quantity: fee,
//     isPrimary: true,
//   };
// };

// const formatCertificates = (certificates: TransactionBody['certs']) => {
//   return (
//     certificates?.map(cert => {
//       const [type, certificate] = Object.entries(cert)[0];
//       return ({ type, value: certificate } as unknown) as FormattedCertificate;
//     }) ?? null
//   );
// };

// const formatMintData = (
//   mintData: TransactionBody['mint'] | null,
//   portfolioTokenInfos: ReturnType<typeof usePortfolioTokenInfos>
// ) => {
//   if (mintData == null) return null;
//   return (mintData?.flatMap(([policyId, tokens]) =>
//     Object.entries(tokens)
//       .map(([assetNameHex, count]) => [portfolioTokenInfos.tokenInfos?.get(`${policyId}.${assetNameHex}`), count])
//       .filter(([tokenInfo]) => tokenInfo != null)
//   ) ?? []) as Array<[Portfolio.Token.Info, string]>;
// };

const deriveAddress = async (address: string, chainId: number) => {
  try {
    return await deriveRewardAddressFromAddress(address, chainId);
  } catch {
    return null;
  }
};

const getAddressKind = async (addressBech32: string): Promise<any> => {
  try {
    const address = await RustModule.WalletV4.Address.fromBech32(addressBech32).to_bech32();
    const addressKind = await (await address.paymentCred())?.kind();
    return addressKind ?? null;
  } catch {
    return null;
  }
};

export const useUtxos = (inputs: TransactionInputs, walletUtxos: any) => {
  const query = useQuery(['useUtxos', inputs], async () => getAllUtxos(inputs, walletUtxos), {
    suspense: true,
  });
  if (!query.data) throw new Error('invalid formatted inputs');
  return query.data;
};

const getAllUtxos = async (inputs: TransactionInputs, walletUtxos: any) => {
  return Promise.all(inputs.map(input => getUtxo(walletUtxos, input?.transaction_id, input.index))) ?? [];
};

const getUtxo = async (utxos: any, txHash: string, txIndex: number) => {
  const internalUtxo = utxos.find(
    u => u.output.Transaction.Hash === txHash && u.output.UtxoTransactionOutput.OutputIndex === txIndex
  );
  console.log('internalUtxo', internalUtxo);

  const hexAddr = RustModule.WalletV4.Address.from_hex(internalUtxo.address).to_bech32();
  return {
    amount: internalUtxo.output?.tokens[0].TokenList.Amount,
    assets: [],
    receiver: hexAddr,
    tx_hash: internalUtxo.output.Transaction.Hash,
    tx_index: internalUtxo.output.UtxoTransactionOutput.OutputIndex,
    utxo_id: `${internalUtxo.output.Transaction.Hash}:${internalUtxo.output.UtxoTransactionOutput.OutputIndex}`,
  };
};

// function toRawUtxo(utxosData: ApiUtxoData, txHash: string, txIndex: number) {
//   const { address, amount, assets } = utxosData.output;

//   const mappedAssets = assets.map(asset => ({
//     amount: asset.amount,
//     assetId: asset.assetId,
//     policyId: asset.policyId,
//     name: asset.name,
//   }));

//   return {
//     amount: amount,
//     receiver: address,
//     tx_hash: txHash,
//     tx_index: txIndex,
//     utxo_id: `${txHash}:${txIndex}`,
//     assets: mappedAssets,
//   };
// }

const isOwnedAddress = (walletAddresses: any, bech32Address: string) => {
  return walletAddresses.filter(a => a.address === bech32Address);
};
