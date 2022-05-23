// @flow
import axios from 'axios';
import {
  BatchedEmurgoUtxoApi,
  EmurgoUtxoApi
} from '@emurgo/yoroi-lib-core/dist/utxo/emurgo-api';
import type { UtxoApiContract } from '@emurgo/yoroi-lib-core/dist/utxo/api';

export default class UtxoApi extends BatchedEmurgoUtxoApi {
  // so that the unit tests can override it with mocks
  static utxoApiFactory: (string) => UtxoApiContract = (backendServiceUrl) =>
    new EmurgoUtxoApi(axios, backendServiceUrl + '/', true);

  constructor(backendServiceUrl: string) {
    const utxoApi = UtxoApi.utxoApiFactory(backendServiceUrl);
    super(utxoApi);
  }
}
