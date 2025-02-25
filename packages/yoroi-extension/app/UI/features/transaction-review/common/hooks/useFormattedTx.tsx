// import { usePortfolioTokenInfos } from '../../../Portfolio/common/hooks/usePortfolioTokenInfos';
// import { useSelectedNetwork } from '../../../WalletManager/common/hooks/useSelectedNetwork';
import { CredKind } from '@emurgo/cross-csl-core';
import { isNonNullable } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import { useQuery } from 'react-query';
import { RustModule } from '../../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { deriveRewardAddressFromAddress } from '../../../../utils/common';
import { asQuantity } from '../../../../utils/createCurrentWalletInfo';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { FormattedTx, TransactionBody, TransactionInputs } from '../types';

export const useFormattedTx = (data: TransactionBody): FormattedTx => {
  const { walletUtxos, walletAddresses, primaryTokenInfo, ftAssetsList, networkId } = useTxReviewModal();
  const inputs = data?.inputs ?? [];
  const outputs = data?.outputs ?? [];
  const referenceInputs = data?.reference_inputs ?? [];

  const inputUtxos = useUtxos(inputs, walletUtxos);

  const formattedFee = formatFee(primaryTokenInfo, data);

  const referenceInputUtxos = useUtxos(referenceInputs, walletUtxos);
  const formattedCertificates = formatCertificates(data?.certs);

  const formattedInputs = useFormattedInputs(inputUtxos, ftAssetsList, networkId, primaryTokenInfo, walletAddresses);
  const formattedOutputs = useFormattedOutputs(outputs, networkId, primaryTokenInfo, walletAddresses);

  return {
    inputs: formattedInputs,
    outputs: formattedOutputs,
    fee: formattedFee,
    certificates: formattedCertificates,
    // mint: formattedMintData,
    referenceInputs: referenceInputUtxos,
  };
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

export const useFormattedOutputs = (outputs, networkId, primaryTokenInfo, walletAddresses) => {
  const query = useQuery<any>(
    ['useFormattedOutputs', outputs],
    () => formatOutputs(outputs, networkId, primaryTokenInfo, walletAddresses),
    {
      suspense: true,
    }
  );

  if (!query.data) throw new Error('invalid formatted outputs');
  return query.data;
};

const formatInputs = async (inputUtxos, ftAssetsList, networkId, primaryTokenInfo, walletAddresses): Promise<any> => {
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
          .map((a: any) => {
            const tokenInfo = ftAssetsList.get(a?.assetId);
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
        ownAddress: address != null ? isOwnedAddress(walletAddresses, address) : null,
        txIndex: utxo.tx_index,
        txHash: utxo.tx_hash,
      };
    })
  );
};

type Output = {
  address: string;
  amount: {
    coin: BigNumber;
    multiasset: any;
  };
  plutus_data: any;
  script_ref: any;
};

const sumAmountsByAddress = (outputs: Output[]) => {
  return outputs.reduce((acc, output) => {
    if (acc[output.address]) {
      acc[output.address] = acc[output.address].plus(output.amount.coin);
    } else {
      acc[output.address] = new BigNumber(output.amount.coin);
    }
    return acc;
  }, {});
};

const formatOutputs = async (outputs: Output[], networkId: number, primaryTokenInfo: any, walletAddresses: any): Promise<any> => {
  const summedOutputs = sumAmountsByAddress(outputs);
  return Promise.all(
    Object.entries(summedOutputs).map(async ([address, totalCoin]) => {
      const coin: any = totalCoin;
      const addressKind = await getAddressKind(address);
      const rewardAddress = addressKind === CredKind.Key ? await deriveAddress(address, networkId) : null;
      const primaryAssets = [
        {
          tokenInfo: primaryTokenInfo,
          quantity: asQuantity(coin.toString()),
        },
      ];

      const multiAssets = outputs
        .filter(output => output.address === address && output.amount.multiasset !== null)
        .flatMap(output =>
          Object.entries(output.amount.multiasset).flatMap(([policyId, assets]: any) => {
            return Object.entries(assets).map(([assetId, amount]) => {
              const tokenInfo = primaryTokenInfo.tokenInfos?.get(`${policyId}.${assetId}`);
              if (tokenInfo === undefined || primaryTokenInfo == null) return null;

              return {
                tokenInfo,
                quantity: asQuantity(new BigNumber(String(amount)).toString()),
              };
            });
          })
        )
        .filter(isNonNullable);

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

const deriveAddress = async (address: string, chainId: number) => {
  try {
    return await deriveRewardAddressFromAddress(address, chainId);
  } catch {
    return null;
  }
};

const getAddressKind = async (addressBech32: string): Promise<any> => {
  try {
    const address = await RustModule.WalletV4.Address.from_bech32(addressBech32);
    const addressKind = address.payment_cred().kind();

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
