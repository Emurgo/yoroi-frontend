import BigNumber from 'bignumber.js';
import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { PRICE_IMPACT_HIGH_RISK, PRICE_IMPACT_MODERATE_RISK } from './constants';
export const normalizeTokenId = (id?: string | null) => (id === '' ? '.' : id);

type WalletUtxo = {
  address: string; // raw address bytes (hex)
  output: {
    Transaction: { Hash: string }; // 64-hex
    UtxoTransactionOutput: { OutputIndex: number };
    tokens?: Array<{
      Token: {
        Identifier: string; // '.' for ADA, or `${policyId}.${assetNameHex}`
        Metadata: { ticker?: string; policyId?: string; assetName?: string };
      };
      TokenList: { Amount: string };
    }>;
    inlineDatumCborHex?: string;
    datumHashHex?: string;
    scriptRefCborHex?: string;
  };
};

const isHex = (s: string) => /^[0-9a-f]*$/i.test(s);
const isHex64 = (s: string) => /^[0-9a-f]{64}$/i.test(s);
const hexToBytes = (hex: string): Uint8Array => {
  if (!isHex(hex) || hex.length % 2 !== 0) throw new Error('Invalid hex');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
};
const bytesToHex = (bytes: Uint8Array): string => {
  let hex = '';
  // @ts-ignore
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
};
const looksLikeTUSO = (hex: string) =>
  typeof hex === 'string' && /^[0-9a-f]+$/i.test(hex) && hex.toLowerCase().startsWith('82825820'); // 82 [input,output] / 82 [hash,index] / 58 20 (32-byte hash)

export const useGetInputs = (walletUtxos: WalletUtxo[]) => {
  // encode one UTxO -> CBOR hex TUSO
  const encodeUtxo = (u: WalletUtxo): string => {
    const { WalletV4 } = RustModule;

    const input = WalletV4.TransactionInput.new(
      WalletV4.TransactionHash.from_hex(u.output.Transaction.Hash),
      u.output.UtxoTransactionOutput.OutputIndex
    );

    const addr = WalletV4.Address.from_bytes(hexToBytes(u.address));

    const value = WalletV4.Value.new(WalletV4.BigNum.from_str('0'));
    const ma = WalletV4.MultiAsset.new();
    let lovelaceSet = false;

    for (const t of u.output.tokens ?? []) {
      const amt = WalletV4.BigNum.from_str(t.TokenList.Amount);
      const isAda = t.Token.Identifier === '.' || (t.Token.Metadata?.ticker ?? '').toUpperCase() === 'ADA';

      if (isAda) {
        value.set_coin(amt);
        lovelaceSet = true;
      } else {
        const policyId = t.Token.Metadata?.policyId;
        const assetNameHex = t.Token.Metadata?.assetName;
        if (!policyId || !assetNameHex) continue;
        const policy = WalletV4.ScriptHash.from_hex(policyId);
        const assets = ma.get(policy) ?? WalletV4.Assets.new();
        assets.insert(WalletV4.AssetName.new(hexToBytes(assetNameHex)), amt);
        ma.insert(policy, assets);
      }
    }

    if (!lovelaceSet) value.set_coin(WalletV4.BigNum.from_str('0'));
    if (ma.len() > 0) value.set_multiasset(ma);

    const out = WalletV4.TransactionOutput.new(addr, value);

    if (u.output.inlineDatumCborHex) {
      out.set_datum(WalletV4.Datum.new_data(WalletV4.PlutusData.from_bytes(hexToBytes(u.output.inlineDatumCborHex))));
    } else if (u.output.datumHashHex) {
      out.set_datum(WalletV4.Datum.new_data_hash(WalletV4.DataHash.from_bytes(hexToBytes(u.output.datumHashHex))));
    }
    if (u.output.scriptRefCborHex) {
      out.set_script_ref(WalletV4.ScriptRef.from_bytes(hexToBytes(u.output.scriptRefCborHex)));
    }

    const tuso = WalletV4.TransactionUnspentOutput.new(input, out);
    const hex = bytesToHex(tuso.to_bytes());
    if (!looksLikeTUSO(hex)) throw new Error(`Not a full TransactionUnspentOutput: ${hex.slice(0, 10)}…`);
    return hex;
  };

  // dedupe + validate by (txHash#index)
  const sanitize = (list: WalletUtxo[]) => {
    const seen = new Set<string>();
    const out: WalletUtxo[] = [];
    for (const u of list) {
      const txh = u.output?.Transaction?.Hash;
      const idx = u.output?.UtxoTransactionOutput?.OutputIndex;
      if (!txh || typeof idx !== 'number' || !isHex64(txh)) continue;
      const key = `${txh}#${idx}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(u);
    }
    // stable order
    out.sort(
      (a, b) =>
        a.output.Transaction.Hash.localeCompare(b.output.Transaction.Hash) ||
        a.output.UtxoTransactionOutput.OutputIndex - b.output.UtxoTransactionOutput.OutputIndex
    );
    return out;
  };

  // returns ALL UTXOs as TUSO CBOR hex
  const getInputs = async (): Promise<string[]> => {
    const utxos = sanitize(walletUtxos);
    return utxos.map(encodeUtxo);
  };

  return { getInputs };
};

export function sanitizeSlippageInput(
  raw: string,
  { max = 75, maxDecimals = 1 }: { max?: number; maxDecimals?: number } = {}
): string | null {
  let clean = (raw ?? '').replace(/[^0-9.]/g, '');

  // keep only the first dot
  let parts = clean.split('.');
  if (parts.length > 2) {
    clean = `${parts[0]}.${parts[1]}`;
    parts = clean.split('.'); // re-split after modifying
  }

  // limit decimals
  const decimals = parts[1] ?? '';
  if (decimals.length > maxDecimals) {
    clean = `${parts[0]}.${decimals.slice(0, maxDecimals)}`;
  }

  // enforce max (ignore change if over)
  if (clean !== '' && !Number.isNaN(Number(clean)) && Number(clean) > max) {
    return null;
  }

  return clean;
}

export const toBaseUnits = (val?: string | null, decimals = 0): bigint | null => {
  const s = (val ?? '').trim();
  if (s === '') return null;
  const bn = new BigNumber(s);
  if (!bn.isFinite() || bn.isNegative()) return null;
  const dp = bn.decimalPlaces();
  if ((dp ?? 0) > decimals) return null; // too many fraction digits
  // shift to base units and floor (no rounding up), then to bigint
  return BigInt(bn.shiftedBy(decimals).integerValue(BigNumber.ROUND_DOWN).toFixed());
};

export const getPriceImpactRisk = (priceImpact: number) => {
  if (priceImpact < PRICE_IMPACT_MODERATE_RISK || isNaN(priceImpact)) return 'none';
  if (priceImpact > PRICE_IMPACT_HIGH_RISK) return 'high';
  return 'moderate';
};