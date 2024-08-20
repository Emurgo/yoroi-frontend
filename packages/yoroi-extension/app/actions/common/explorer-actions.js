// @flow
import { AsyncAction, } from '../lib/Action';

export default class ExplorerActions {
  updateSelectedExplorer: AsyncAction<{|
    networkId: number, explorerId: string,
  |}> = new AsyncAction();
}
