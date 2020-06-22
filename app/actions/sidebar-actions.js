// @flow
import { Action } from './lib/Action';

export default class SidebarActions {
  activateSidebarCategory: Action<{| category: string |}> = new Action();
}
