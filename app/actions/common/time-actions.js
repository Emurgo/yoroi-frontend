// @flow
import { AsyncAction, } from '../lib/Action';

export default class TimeActions {
  tick: AsyncAction<void> = new AsyncAction();
}
