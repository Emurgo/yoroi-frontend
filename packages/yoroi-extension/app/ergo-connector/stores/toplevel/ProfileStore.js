// @flow
import BaseProfileStore from '../../../stores/base/BaseProfileStore';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class ProfileStore extends BaseProfileStore<StoresMap, ActionsMap> {

  setup(): void {
    super.setup();
  }

  teardown(): void {
    super.teardown();
  }
}
