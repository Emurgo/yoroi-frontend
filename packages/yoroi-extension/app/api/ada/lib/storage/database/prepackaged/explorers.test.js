// @flow
import '../../../test-config.forTests';
import { prepackagedExplorers } from './explorers';

test('Only one backup per network', async () => {
  for (const networkExplorers of prepackagedExplorers.values()) {
    const backups = networkExplorers.filter(explorer => explorer.IsBackup);
    expect(backups.length).toEqual(1);
  }
});
