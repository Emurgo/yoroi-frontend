// @flow
import { PublicDeriver } from '../lib/storage/models/PublicDeriver';
import { connectorSignCardanoTx } from '../../../../chrome/extension/connector/api';
import { transactionHexReplaceWitnessSet, transactionHexToWitnessSet } from '../lib/cardanoCrypto/utils';
import { mergeWitnessSets } from './utils';

export async function signTransactionHex(wallet: PublicDeriver<>, password: string, transactionHex: string): Promise<string> {
  // <TODO:REFACTOR> This signing function must be moved from the connector to the main api
  const signedWitnessSetHex = await connectorSignCardanoTx(
    wallet,
    password,
    {
      tx: transactionHex,
      tabId: -1,
      partialSign: false
    },
  );
  // <TODO:REFACTOR> This signing function must be moved from the connector to the main api
  const mergedWitnessSetHex = mergeWitnessSets(
    transactionHexToWitnessSet(transactionHex),
    signedWitnessSetHex,
  );
  return transactionHexReplaceWitnessSet(transactionHex, mergedWitnessSetHex);
}