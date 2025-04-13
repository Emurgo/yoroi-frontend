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
}): TransactionBody => {
  const query = useQuery(['useTxBody', cbor, unsignedTx], async () => {
    if (unsignedTx === null) {
      return getCborTxBody(cbor);
    } else if (cbor === null) {
      return getUnsignedTxTxBody(unsignedTx);
    } else {
      throw new Error('useTxBody: missing cbor and unsignedTx');
    }
  });

  return query.data;
};

const getCborTxBody = async (cbor: any) => {
  try {
    const txBody = RustModule.WalletV4.FixedTransaction.from_hex(cbor).body().to_json();
    const parsed = JSON.parse(txBody);
    return parsed;
  } catch (e) {
    console.warn('getCborTxBody', e);
  }
};

const getUnsignedTxTxBody = async (unsignedTx: any) => {
  const txBodyjson = await unsignedTx.build_tx().to_json();
  const parsedUnsignedTx = JSON.parse(txBodyjson);
  return parsedUnsignedTx;
};
