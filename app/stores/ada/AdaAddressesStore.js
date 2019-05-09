// @flow

import { observable } from 'mobx';
import AddressesStore from '../base/AddressesStore';
import Request from '../lib/LocalizedRequest';
import type {
  CreateAddressFunc,
} from '../../api/ada';

export default class AdaAddressesStore extends AddressesStore {

  // REQUESTS
  @observable createAddressRequest: Request<CreateAddressFunc>
    = new Request<CreateAddressFunc>(this.api.ada.createAddress);

  setup() {
    super.setup();
  }
}
