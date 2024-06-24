// @flow
import { getDb } from './databaseManager';
export { getDb };
export { refreshingWalletIdSet, syncWallet } from './refreshScheduler';
export { subscribe } from  './subscriptionManager';

export async function init(): Promise<void> {
  // eagerly cache
  await getDb();
}
