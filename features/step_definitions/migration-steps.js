// @flow

import { Then } from 'cucumber';

const lastestVersion = require('../../chrome/manifest.test.json').version;

Then(/^Last launch version is updated$/, async function () {
  await this.driver.wait(async () => {
    const lastLaunchVersion = await getLastLaunchVersion(this.driver);
    return lastLaunchVersion === lastestVersion;
  });
});

Then(/^I decrease last launch version$/, async function () {
  await this.driver.wait(async () => {
    await setLastLaunchVersion(this.driver, '0.0.1');
    return true;
  });
});

declare var yoroi;

async function getLastLaunchVersion(client: any) {
  return await client.executeScript(() => yoroi.stores.profile.lastLaunchVersion);
}

async function setLastLaunchVersion(client: any, version: string) {
  return await client.executeScript(
    (ver) => yoroi.stores.profile.setLastLaunchVersion(ver), version
  );
}
