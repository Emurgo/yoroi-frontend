// @flow
import { observable } from 'mobx';
import BigNumber from 'bignumber.js';
import type {
  BIP32Path,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

export default class WalletAddress {

  // should never change
  id: string = '';
  path: BIP32Path = [];

  @observable amount: BigNumber;
  @observable isUsed: boolean = false;

  constructor(data: {
    id: string,
    path: BIP32Path,
    amount: BigNumber,
    isUsed: boolean,
  }) {
    Object.assign(this, data);
  }

}
