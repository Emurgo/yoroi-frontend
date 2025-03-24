import { useQuery } from 'react-query';

import { TransactionBody } from '../types';

export const formatMetadata = async (unsignedTx: any, txBody: TransactionBody): Promise<any> => {
  try {
    const hash = txBody.auxiliary_data_hash ?? null;
    const decodedMetadata = await unsignedTx.auxiliary_data.metadata;
    const parsedMetadata = parseMetadata(decodedMetadata);

    return {
      hash,
      metadata: parsedMetadata,
    };
  } catch {
    console.error('Error parsing metadata');
  }
};

const parseMetadata = (metadata: Record<string, string>) => {
  try {
    const parsed = metadata['674'] ? JSON.parse(metadata['674']) : {};
    const mapArray = parsed.map[0];
    const key = mapArray.k.string;

    const rawList = mapArray.v.list.map((item: any) => item.string);
    let jsonString = rawList.join('').replace(/\\/g, '');

    // Safer way to extract multiple JSON objects
    const jsonFragments: object[] = [];
    let braceCount = 0;
    let currentFragment = '';

    for (const char of jsonString) {
      if (char === '{') braceCount++;
      if (braceCount > 0) currentFragment += char;
      if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          try {
            jsonFragments.push(JSON.parse(currentFragment));
          } catch (e) {
            console.error('Error parsing JSON fragment:', currentFragment, e);
          }
          currentFragment = '';
        }
      }
    }

    const mergedObject = jsonFragments.reduce((acc, obj) => ({ ...acc, ...obj }), {});

    Object.keys(mergedObject).forEach(key => {
      if (mergedObject[key] === '') {
        mergedObject[key] = '.';
      }
    });

    return { [key]: [mergedObject] };
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
    queryFn: () => formatMetadata(unsignedTx, txBody),
    queryKey: ['useFormattedMetadata', cbor, unsignedTx, txBody],
    useErrorBoundary: true,
    suspense: true,
    enabled: unsignedTx?.auxiliary_data?.metadata !== undefined,
  });

  return query?.data;
};
