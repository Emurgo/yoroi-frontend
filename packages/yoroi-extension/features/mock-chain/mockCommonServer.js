// @flow

// MockData should always be consistent with the following values
import type {
  SignedRequestInternal,
  SignedResponse,
} from '../../app/api/ada/lib/state-fetch/types';
import mockImporter from './mockCardanoImporter';
import { bodyParser, create, defaults } from 'json-server';
import type {
  AddressUtxoRequest,
  AddressUtxoResponse,
  UtxoSumRequest,
  UtxoSumResponse,
} from '../../app/api/jormungandr/lib/state-fetch/types';
import chai from 'chai';

export const txsLimit = 20;
const addressesLimit = 50;

export function validateAddressesReq({
  addresses,
}: { addresses: Array<string>, ... } = {}): boolean {
  if (!addresses || addresses.length > addressesLimit || addresses.length === 0) {
    throw new Error('Addresses request length should be (0, ' + addressesLimit + ']');
  }
  // TODO: Add address validation
  return true;
}

export function defaultSignedTransaction(
  req: { body: SignedRequestInternal, ... },
  res: { send(arg: SignedResponse): any, ... }
): void {
  const response = mockImporter.sendTx(req.body);
  res.send(response);
}

export function getCommonServer(settings: {
  signedTransaction?: (
    req: { body: SignedRequestInternal, ... },
    res: {
      send(arg: SignedResponse): any,
      status: Function,
      ...
    }
  ) => void,
  // Whether to output request logs. Defaults to false.
  outputLog?: boolean,
  ...
}) {
  const middlewares = [...defaults({ logger: !!settings.outputLog }), bodyParser];

  const server = create();

  server.use(middlewares);

  server.post(
    '/api/txs/utxoForAddresses',
    async (
      req: { body: AddressUtxoRequest, ... },
      res: { send(arg: AddressUtxoResponse): any, ... }
    ): Promise<void> => {
      chai.assert.isTrue(validateAddressesReq(req.body));
      const utxoForAddresses = await mockImporter.utxoForAddresses(req.body);
      res.send(utxoForAddresses);
    }
  );

  server.post(
    '/api/txs/utxoSumForAddresses',
    async (
      req: { body: UtxoSumRequest, ... },
      res: { send(arg: UtxoSumResponse): any, ... }
    ): Promise<void> => {
      chai.assert.isTrue(validateAddressesReq(req.body));
      const utxoSumForAddresses = await mockImporter.utxoSumForAddresses(req.body);
      res.send(utxoSumForAddresses);
    }
  );

  return server;
}
