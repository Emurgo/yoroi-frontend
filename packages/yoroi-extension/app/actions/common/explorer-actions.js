// @flow
import { AsyncAction, } from '../lib/Action';
import type {
  ExplorerRow
} from '../../api/ada/lib/storage/database/explorers/tables';

export default class ExplorerActions {
  updateSelectedExplorer: AsyncAction<{|
    explorer: $ReadOnly<ExplorerRow>,
  |}> = new AsyncAction();
}
