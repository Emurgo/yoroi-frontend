import { useQuery } from 'react-query';

import { TransactionBody } from '../types';

export const formatMetadata = async (unsignedTx: any, cbor: string | null, txBody: TransactionBody): Promise<any> => {
  try {
    const hash = txBody.auxiliary_data_hash ?? null;
    const decodedMetadata = await unsignedTx.auxiliary_data.metadata;
    const parsedMetadata = parseMetadata222(decodedMetadata);
    // const msg = [parseMsg(JSON.parse(decodedMetadata)?.msg ?? [''])];

    // console.log('JSON.parse(decodedMetadata)', JSON.parse(decodedMetadata['674']));

    return {
      hash,
      metadata: parsedMetadata,
    };
  } catch {
    console.error('Error parsing metadata');
  }
};

const parseMetadata222 = (metadata: Record<string, string>) => {
  try {
    const parsed = JSON.parse(metadata['674']);
    const mapArray = parsed.map[0]; // Extract "map" array
    const key = mapArray.k.string; // Extract the key (e.g., "msg")

    const rawList = mapArray.v.list.map((item: any) => item.string); // Extract list of strings

    let jsonString = rawList.join(''); // Merge into a single string
    jsonString = jsonString.replace(/\\/g, ''); // Remove extra escape characters

    let jsonFragments = jsonString.match(/\{.*?\}/g) || []; // Extract JSON objects

    const list = jsonFragments
      .map(fragment => {
        try {
          return JSON.parse(fragment);
        } catch (e) {
          console.error('Error parsing JSON fragment:', fragment, e);
          return null;
        }
      })
      .filter(Boolean);

    const mergedObject = list.reduce((acc, obj) => ({ ...acc, ...obj }), {});

    Object.keys(mergedObject).forEach(key => {
      if (mergedObject[key] === '') {
        mergedObject[key] = '.';
      }
    });

    return { [key]: [mergedObject] }; // Return properly structured output
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return {};
  }
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
