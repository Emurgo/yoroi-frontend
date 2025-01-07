import { useQuery } from 'react-query';

import { YoroiUnsignedTx } from '../../../../types/yoroi';
import { wrappedCsl } from '../../../../utils/wrappedCsl';
import { TransactionBody } from '../types';

export const useTxBody = ({
  cbor,
  unsignedTx,
}: {
  cbor?: string | null;
  unsignedTx?: YoroiUnsignedTx | null;
}): TransactionBody => {
  console.log('unsignedTx', unsignedTx);
  const query = useQuery(
    ['useTxBody', cbor, unsignedTx],
    async () => {
      // ORDER IS IMPORTANT
      // cbor comes from navigation params and unsigned tx from provider
      // Reason is unsignedTx can change during the CATALYST registration funnel (CIP36)
      // TODO: eliminate the use of unsigned tx entirely
      if (cbor != undefined) {
        return getCborTxBody(cbor);
      } else if (unsignedTx != undefined) {
        return getUnsignedTxTxBody(unsignedTx);
      } else {
        throw new Error('useTxBody: missing cbor and unsignedTx');
      }
    },
    {
      useErrorBoundary: true,
      suspense: true,
    }
  );

  if (query.data === undefined) throw new Error('useTxBody: cannot extract txBody');
  return query.data;
};
const getCborTxBody = async (cbor: string) => {
  const { csl, release } = wrappedCsl();
  try {
    const tx = await csl.Transaction.fromHex(cbor);
    const jsonString = await tx.toJson();
    return JSON.parse(jsonString).body;
  } finally {
    release();
  }
};

const getUnsignedTxTxBody = async (unsignedTx: YoroiUnsignedTx) => {
  const {
    unsignedTx: { _txBody },
  } = unsignedTx;
  console.log('_txBody', _txBody);
  const txBodyjson = await _txBody.toJson();
  console.log('txBodyjson', txBodyjson);
  return JSON.parse(txBodyjson);
};
