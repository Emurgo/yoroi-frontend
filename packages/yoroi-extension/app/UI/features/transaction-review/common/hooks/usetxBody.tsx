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
    unsignedTx: { txBody },
  } = unsignedTx;

  // const txBodyjson = await txBody.toJson();
  return testMockTxBody;
  // return JSON.parse(txBodyjson);
};

const testMockTxBody = {
  inputs: [
    {
      transaction_id: 'a29e0647a3c3767148af799e997cb996c941813c7d4499f1b0a62a7d0f5046d4',
      index: 1,
    },
    {
      transaction_id: 'a29e0647a3c3767148af799e997cb996c941813c7d4499f1b0a62a7d0f5046d4',
      index: 3,
    },
  ],
  outputs: [
    {
      address: 'addr1zyq0kyrml023kwjk8zr86d5gaxrt5w8lxnah8r6m6s4jp4g3r6dxnzml343sx8jweqn4vn3fz2kj8kgu9czghx0jrsyqqktyhv',
      amount: {
        coin: '3950000',
        multiasset: null,
      },
      plutus_data: {
        DataHash: 'd5d4865c382b166cf0664a206b85f5ebf1eff7fccd6986f9766a88230ba3bcdc',
      },
      script_ref: null,
    },
    {
      address: 'addr1q8afnth730r7u9v568qnqdtsp6du9ay6766h4gy6uhkdckzs27v5vqkrt30n773669yeynnxkdh0pdytv57t296pn4qq726e0s',
      amount: {
        coin: '2300617',
        multiasset: null,
      },
      plutus_data: null,
      script_ref: null,
    },
  ],
  fee: '338482',
  ttl: '144764927',
  certs: null,
  withdrawals: null,
  update: null,
  auxiliary_data_hash: '8d049b433666860e10be16ed5819675c4cee6f95fc22dd1ea772c62632cc03d5',
  validity_start_interval: null,
  mint: null,
  script_data_hash: 'd5bb42635c69312849872488c164bb8e4ad62396ea5a0ba6adbe0c6dcfbc73fb',
  collateral: null,
  required_signers: null,
  network_id: null,
  collateral_return: null,
  total_collateral: null,
  reference_inputs: null,
  voting_procedures: null,
  voting_proposals: null,
  donation: null,
  current_treasury_value: null,
};
