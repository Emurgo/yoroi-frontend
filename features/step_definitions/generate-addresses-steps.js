import { When, Then } from 'cucumber';
import chai from 'chai';

When(/^I go to the receive screen$/, async function () {
  await this.click('.receive');
});

When(/^I click on the Generate new address button$/, async function () {
  await this.click('.generateAddressButton');
});

Then(/^I should see my latest address at the top$/, async function (table) {
  const fields = table.hashes()[0];
  const screenLatestAddress =
    await this.getElementBy('.WalletReceive_hash')
          .getText();
  chai.expect(screenLatestAddress).to.equal(fields.latestAddress);
});

Then(/^I should see the addresses list them$/, async function (table) {
  const fields = table.hashes()[0];
  const sreenAddress =
    await this.getElementBy(`.generatedAddress-${fields.index} .WalletReceive_addressId`)
          .getText();
  chai.expect(sreenAddress).to.equal(fields.address);
});
