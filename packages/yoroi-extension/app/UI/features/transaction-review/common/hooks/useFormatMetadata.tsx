import { useQuery } from 'react-query';

import { TransactionBody } from '../types';

export const formatMetadata = async (unsignedTx: any, txBody: TransactionBody): Promise<any> => {
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
    const parsed = metadata['674'] ? JSON.parse(metadata['674']) : {};
    const mapArray = parsed.map[0];
    const key = mapArray.k.string;

    const rawList = mapArray.v.list.map((item: any) => item.string);

    let jsonString = rawList.join('');
    jsonString = jsonString.replace(/\\/g, ''); //

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
  console.log('unsignedTx.auxiliary_data.metadata', unsignedTx?.auxiliary_data?.metadata);
  const query = useQuery({
    queryFn: () => formatMetadata(unsignedTx, txBody),
    queryKey: ['useFormattedMetadata', cbor, unsignedTx, txBody],
    useErrorBoundary: true,
    suspense: true,
    enabled: unsignedTx?.auxiliary_data?.metadata !== undefined,
  });

  return query?.data;
};
