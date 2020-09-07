// @flow

import { Given, When, Then } from 'cucumber';
import { By } from 'selenium-webdriver';
import { expect } from 'chai';
import i18n from '../support/helpers/i18n-helpers';
import { addTransaction, generateTransaction, } from '../mock-chain/mockCardanoImporter';
import { setExpectedTx, } from '../mock-chain/mockCardanoServer';
import { truncateAddress, } from '../../app/utils/formatters';

When(/^I go to the dashboard screen$/, async function () {
  await this.click('.stakeDashboard ');
});
