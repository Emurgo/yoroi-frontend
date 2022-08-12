// @flow

import { Then } from 'cucumber';
import { extensionTabName, trezorConnectTabName } from '../support/windowManager';
import {
  confirmUsingTrezorButton,
  dontAskAgainCheckbox,
  exportTrezorButton,
} from '../pages/trezorConnectPage';
import { TrezorEmulatorController } from '../support/trezorEmulatorController';
import { expect } from 'chai';
import { verifyButton } from '../pages/verifyAddressPage';

export async function switchToTrezorAndAllow(customWorld: any) {
  // wait for a new tab
  await customWorld.windowManager.findNewWindowAndSwitchTo(trezorConnectTabName);
  // tick the checkbox on the Trezor page and press Allow button
  await customWorld.driver.sleep(1000);
  await customWorld.waitForElement(dontAskAgainCheckbox);
  await customWorld.click(dontAskAgainCheckbox);
  await customWorld.waitForElement(confirmUsingTrezorButton);
  await customWorld.click(confirmUsingTrezorButton);
}

export async function switchToTrezorAndExport(customWorld: any) {
  // wait for a new tab
  await customWorld.windowManager.findNewWindowAndSwitchTo(trezorConnectTabName);
  // tick the checkbox on the Trezor page and press Allow button
  await customWorld.driver.sleep(1000);
  await customWorld.waitForElement(confirmUsingTrezorButton);
  await customWorld.click(confirmUsingTrezorButton);
}

export async function allowPubKeysAndSwitchToYoroi(customWorld: any) {
  // press the Export button
  await customWorld.click(exportTrezorButton);
  // wait for closing the new tab
  await customWorld.windowManager.waitForClosingAndSwitchTo(trezorConnectTabName, extensionTabName);
}

Then(/^I switch to Trezor-connect screen and allow using$/, async function () {
  await switchToTrezorAndAllow(this);
});

Then(/^I press Yes on the Trezor emulator$/, async function () {
  for (let i = 1; i < 5; i++) {
    const pressYesResponse = await this.trezorController.emulatorPressYes();
    expect(pressYesResponse.success, `${i} emulator-press-yes request is failed`).to.be.true;
  }
  await this.windowManager.waitForClosingAndSwitchTo(trezorConnectTabName, extensionTabName);
});

Then(/^I connect to trezor controller$/, async function () {
  this.trezorController = new TrezorEmulatorController(this.trezorEmuLogger);
  await this.trezorController.connect();
  const result = await this.trezorController.getLastEvent();
  expect(result.type).to.be.equal('client', 'Something is wrong with connection');
});

Then(/^I start trezor emulator environment$/, async function () {
  const pingResponse = await this.trezorController.ping();
  expect(pingResponse.success, 'Ping request is failed').to.be.true;

  const bridgeStartResponse = await this.trezorController.bridgeStart();
  expect(bridgeStartResponse.success, 'bridge-start request is failed').to.be.true;

  const emulatorStartResponse = await this.trezorController.emulatorStart();
  expect(emulatorStartResponse.success, 'emulator-start request is failed').to.be.true;

  const emulatorWipeResponse = await this.trezorController.emulatorWipe();
  expect(emulatorWipeResponse.success, 'emulator-wipe request is failed').to.be.true;

  const emulatorSetupResponse = await this.trezorController.emulatorSetup(
    'lyrics tray aunt muffin brisk ensure wedding cereal capital path replace weasel'
  );
  expect(emulatorSetupResponse.success, 'emulator-setup request is failed').to.be.true;
});

Then(/^I verify the address on the trezor emulator$/, async function () {
  await this.click(verifyButton);
  await switchToTrezorAndExport(this);
  for (let i = 1; i < 4; i++) {
    const pressYesResponse = await this.trezorController.emulatorPressYes();
    expect(pressYesResponse.success, `${i} emulator-press-yes request is failed`).to.be.true;
  }
  await this.windowManager.waitForClosingAndSwitchTo(trezorConnectTabName, extensionTabName);
  // we should have this disable while the action is processing, but we don't show a spinner on this
  await this.waitForElementNotPresent({ locator: '.ErrorBlock_component', method: 'css' });
});
