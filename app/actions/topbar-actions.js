// @flow
import Action from './lib/Action';

export default class TopbarActions {
  activateTopbarCategory: Action<{ category: string, showSubMenu?: boolean }> = new Action();
  walletSelected: Action<{ walletId: string }> = new Action();
}
