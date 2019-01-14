// @flow

import { observable } from 'mobx';
import AddressesStore from '../base/AddressesStore';
import Request from '../lib/LocalizedRequest';
import type WalletAddress from '../../domain/WalletAddress';

export default class AdaAddressesStore extends AddressesStore {

  // REQUESTS
  @observable createAddressRequest:
    Request<WalletAddress> = new Request(this.api.ada.createAddress);

  setup() {
    super.setup();
  }
}
