// @flow

import Store from '../base/Store';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

/**
 * Different wallets can be on different networks and therefore have different measures of time
*/
export default class TimeStore extends Store<StoresMap, ActionsMap> {
  intervalId: void | IntervalID;

  setup(): void {
    super.setup();
    // note: doesn't await but that's okay
    this.intervalId = setInterval(this.actions.time.tick.trigger, 1000);
  }

  teardown(): void {
    super.teardown();
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
