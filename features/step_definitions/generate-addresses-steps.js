import { When, Then } from 'cucumber';

When(/^I go to the receive screen$/, async function () {
  await this.click('.receive');
});

When(/^I click on the Generate new address button$/, async function () {
  await this.click('.generateAddressButton');
});

Then(/^I should see my latest address "([^"]*)" at the top$/, async function (address) {
  await this.waitUntilText('.WalletReceive_hash', address);
});

Then(/^I should see the addresses list them$/, async function (table) {
  const rows = table.hashes();
  const waitUntilAddressesAppeared = rows.map((row) =>
    this.waitUntilText(
      `.generatedAddress-${row.index} .WalletReceive_addressId`,
      row.address
    )
  );
  await Promise.all(waitUntilAddressesAppeared);
});
