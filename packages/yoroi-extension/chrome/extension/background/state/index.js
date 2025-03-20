// @flow
import { getDb } from './databaseManager';

export { getDb };
// eslint-disable-next-line import/no-cycle
export { refreshingWalletIdSet, syncWallet } from './refreshScheduler';

export async function init(): Promise<void> {
  // eagerly cache
  await getDb();
}
