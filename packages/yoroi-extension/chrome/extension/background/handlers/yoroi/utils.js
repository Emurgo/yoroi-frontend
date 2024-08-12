// @flow
import { getDb } from '../../state';
import type { PublicDeriver } from '../../../../../app/api/ada/lib/storage/models/PublicDeriver';
import { loadWalletsFromStorage } from '../../../../../app/api/ada/lib/storage/models/load';

export async function getPublicDeriverById(publicDeriverId: number): Promise<PublicDeriver<>> {
  const db = await getDb();
  for (const publicDeriver of await loadWalletsFromStorage(db)) {
    if (publicDeriver.getPublicDeriverId() === publicDeriverId) {
      return publicDeriver;
    }
  }
  throw new Error(`missing public deriver ${publicDeriverId}`);
}
