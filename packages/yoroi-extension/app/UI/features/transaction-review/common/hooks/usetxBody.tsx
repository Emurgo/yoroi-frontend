import { useQuery } from 'react-query';
import { RustModule } from '../../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { YoroiUnsignedTx } from '../../../../types/yoroi';
import { TransactionBody } from '../types';

export const useTxBody = ({
  cbor,
  unsignedTx,
}: {
  cbor?: string | null;
  unsignedTx?: YoroiUnsignedTx | null;
}): TransactionBody | undefined => {
  const query = useQuery(
    ['useTxBody', cbor, unsignedTx],
    async () => {
      if (cbor && typeof cbor === 'string') {
        return getCborTxBody(cbor);
      }

      if (unsignedTx != null) {
        return getUnsignedTxTxBody(unsignedTx);
      }

      throw new Error('useTxBody: missing both cbor and unsignedTx');
    },
    {
      enabled: Boolean(cbor || unsignedTx),
    }
  );

  return query.data;
};

const getCborTxBody = async (cbor: string) => {
  try {
    const txBody = RustModule.WalletV4.FixedTransaction.from_hex(cbor).body().to_json();
    return JSON.parse(txBody);
  } catch (e) {
    console.warn('getCborTxBody failed:', e);
    throw e; // Let the query fail if it's a critical error
  }
};

const getUnsignedTxTxBody = async (unsignedTx: YoroiUnsignedTx) => {
  const txBodyjson = await unsignedTx.build_tx().to_json();
  return JSON.parse(txBodyjson);
};
