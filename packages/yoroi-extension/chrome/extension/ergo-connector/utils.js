// @flow

import type { Tx } from './types';
import type { TokenRow } from '../../../app/api/ada/lib/storage/database/primitives/tables';
import { Logger } from '../../../app/utils/logging';

export function parseEIP0004Data(input: any): ?string {
  // https://github.com/ergoplatform/eips/blob/master/eip-0004.md
  // format is: 0e + vlq(len(body as bytes)) + body (as bytes formatted in hex)
  // where body is a utf8 string
  // and the vlq encoding is also byte-padded e.g. 01 instead of 1
  if (typeof input !== 'string' || !input.startsWith('0e') || input.length < 4) {
    return null
  }
  let body = input.slice(2);
  let len = 0;
  let readNext = true;
  do {
    const lenChunk = parseInt(body.slice(0, 2), 16);
    body = body.slice(2);
    if (isNaN(lenChunk)) {
      return null;
    }
    readNext = (lenChunk & 0x80) !== 0;
    len = (128 * len) + (lenChunk & 0x7F);
  } while (readNext);
  if (2 * len > body.length) {
    Logger.info(`vlq decode trailing data: ${body.slice(2 * len)}`);
  }
  if (2 * len < body.length) {
    return null;
  }
  return Buffer.from(body.slice(0, 2 * len), 'hex').toString('utf8');
}

// you should not be able to mint more than 1
export function mintedTokenInfo(tx: Tx): $ReadOnly<TokenRow>[] {
  const tokens = []
  for (const output of tx.outputs) {
    const name = parseEIP0004Data(output.additionalRegisters.R4);
    const description = parseEIP0004Data(output.additionalRegisters.R5);
    const decimals = parseInt(parseEIP0004Data(output.additionalRegisters.R6) ?? '', 10);
    if (name != null && description != null && decimals != null) {
      tokens.push({
        TokenId: 0,
        NetworkId: 0,
        IsDefault: false,
        Digest: 0,
        Identifier: tx.inputs[0].boxId,
        Metadata: {
          type: 'Ergo',
          height: tx.inputs[0].creationHeight,
          boxId: tx.inputs[0].boxId,
          numberOfDecimals: isNaN(decimals) ? 0 : decimals,
          ticker: name,
          longName: description,
          description,
        }
      });
    }
  }
  if (tokens.length > 1) {
    Logger.info(`tx ${JSON.stringify(tx)} had multiple EIP-0004-looking outputs`);
  }
  return tokens;
}
