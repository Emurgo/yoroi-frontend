import { useQuery } from '@tanstack/react-query';

import { TransactionBody } from '../types';
import { RustModule } from '../../../../../api/ada/lib/cardanoCrypto/rustLoader';

export const formatUnsignedTxMetadata = async (unsignedTx: any, txBody: TransactionBody): Promise<any> => {
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

type FormattedMetadata = { hash: string | null; metadata: unknown | null };

export const formatCborMetadata = (cbor: string, txBody: TransactionBody): FormattedMetadata => {
  const hash = txBody?.auxiliary_data_hash ?? null;
  try {
    const tx = RustModule.WalletV4.Transaction.from_hex(cbor);
    const aux = tx?.auxiliary_data()?.to_json();
    return { hash, metadata: format674(aux) };
  } catch (e) {
    console.error('Error parsing metadata', e);
    return { hash, metadata: null };
  }
};

export const parseMetadata = (metadata: Record<string, string>) => {
  try {
    const parsed = metadata['674'] ? JSON.parse(metadata['674']) : {};
    const mapArray = parsed.map[0];
    const key = mapArray.k.string;

    const rawList = mapArray.v.list.map((item: any) => item.string);
    let jsonString = rawList.join('').replace(/\\/g, '');

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

    const mergedObject = jsonFragments.reduce((acc, obj) => ({ ...acc, ...obj }), {} as any);

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
  const hasCbor = typeof cbor === 'string' && cbor.length > 0;
  const canUnsigned = Boolean(unsignedTx?.auxiliary_data?.metadata);

  const { data } = useQuery({
    queryKey: ['useFormattedMetadata', hasCbor ? cbor : unsignedTx, txBody?.auxiliary_data_hash],
    enabled: hasCbor || canUnsigned,
    throwOnError: true,
    queryFn: () => (hasCbor && cbor ? formatCborMetadata(cbor, txBody) : formatUnsignedTxMetadata(unsignedTx, txBody)),
  });

  return data;
};

// 1) de-string any double-encoded JSON
const deepParse = (x: any, d = 0): any => {
  if (d > 6 || x == null) return x;
  const tryParse = (s: string) => {
    const t = s.trim();
    if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
      try {
        return JSON.parse(t);
      } catch {
        return s;
      }
    }
    return s;
  };
  const v = typeof x === 'string' ? tryParse(x) : x;

  // handle "null"
  if (v == null) return v;

  if (Array.isArray(v)) return v.map(y => deepParse(y, d + 1));
  if (typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, deepParse(val, d + 1)]));
  }
  return v;
};

// 2) turn the 674 "CBOR-JSON" shape into { key: value }
const format674 = (raw: any) => {
  const data = deepParse(raw);
  const label =
    data?.metadata?.['674'] ??
    data?.['674'] ?? // sometimes it’s already at root
    null;

  if (!label || typeof label !== 'object' || !Array.isArray(label.map)) return null;

  const out: Record<string, any> = {};
  for (const entry of label.map) {
    const key = entry?.k?.string ?? entry?.k;
    let val = entry?.v;

    if (val?.list) val = val.list.map((x: any) => x?.string ?? x);
    else if (val?.string) val = val.string;

    if (key != null) out[key] = val;
  }
  return out;
};
