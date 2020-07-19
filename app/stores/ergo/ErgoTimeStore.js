// @flow

import { action, } from 'mobx';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import Store from '../base/Store';

/**
 * Different wallets can be on different networks and therefore have different measures of time
*/
export default class ErgoTimeStore extends Store {

  setup(): void {
    super.setup();
  }

  @action addObservedTime: PublicDeriver<> => void = (
    _publicDeriver
  ) => {
    // TODO
  }

  teardown(): void {
    super.teardown();
  }
}
