import { MetadataJsonSchema } from '@emurgo/cross-csl-core';
import { useQuery } from 'react-query';

import { wrappedCsl } from '../../../../yoroi-wallets/cardano/wrappedCsl';
import { FormattedMetadata, TransactionBody } from '../types';

export const formatMetadata = async (
  unsignedTx: any,
  cbor: string | null,
  txBody: TransactionBody
): Promise<FormattedMetadata> => {
  const { csl, release } = wrappedCsl();

  try {
    const hash = txBody.auxiliary_data_hash ?? null;
    let metadata = null;
    let generalTransactionMetadata = null;

    if (unsignedTx != null && unsignedTx.unsignedTx.auxiliaryData && hash != null) {
      generalTransactionMetadata = await unsignedTx.unsignedTx.auxiliaryData?.metadata();
    } else if (cbor != null && hash != null) {
      const tx = await csl.Transaction.fromHex(cbor);
      const auxiliaryData = await tx.auxiliaryData();
      generalTransactionMetadata = await auxiliaryData?.metadata();
    }

    const metadata674 = await generalTransactionMetadata?.get(await csl.BigNum.fromStr('674'));
    if (metadata674) {
      const decodedMetadata = await csl.decodeMetadatumToJsonStr(metadata674, MetadataJsonSchema.BasicConversions);
      const msg = [parseMsg(JSON.parse(decodedMetadata)?.msg ?? [''])];
      metadata = { msg };
    }

    return {
      hash,
      metadata,
    };
  } finally {
    release();
  }
};

const parseMsg = (msg: Array<string>) => {
  if (msg.length > 1) {
    const message = msg.join('');
    try {
      return JSON.parse(message);
    } catch {
      return message;
    }
  }
  return msg[0];
};

export const useFormattedMetadata = ({
  unsignedTx,
  cbor,
  txBody,
}: {
  unsignedTx: any;
  cbor: string | null;
  txBody: TransactionBody;
}) => {
  const query = useQuery({
    queryFn: () => formatMetadata(unsignedTx, cbor, txBody),
    queryKey: ['useFormattedMetadata', cbor, unsignedTx, txBody],
    useErrorBoundary: true,
    suspense: true,
  });

  return query?.data;
};
