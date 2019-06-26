// @flow
import './lib/test-config';
import AdaApi from './index';
import { RustModule } from './lib/cardanoCrypto/rustLoader';

import type {
  FilterUsedRequest,
  FilterUsedResponse,
} from './lib/state-fetch/types';

beforeAll(async () => {
  await RustModule.load();
});

test('Restore wallet', async () => {
  async function checkAddressesInUse(_body: FilterUsedRequest): Promise<FilterUsedResponse> {
    return [];
  }

  const restoreRequest = {
    recoveryPhrase: 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed',
    walletName: 'mywallet',
    walletPassword: '123',
    checkAddressesInUse
  };

  const response : any = await AdaApi.prototype.restoreWallet(restoreRequest);
  expect(response.accounts[0].plate.id).toEqual('DBJL-9530');
});
