// @flow
import { AsyncAction } from '../lib/Action';

export default class VotingActions {
  generateEncryptedKey: AsyncAction<Array<number>> = new AsyncAction();
}
