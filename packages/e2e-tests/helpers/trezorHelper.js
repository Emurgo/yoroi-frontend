import { expect } from 'chai';

export const runAndPrepareTrezor = async (trezorController, trezorMnemonic) => {
  await trezorController.connect();
  const result = await trezorController.getLastEvent();
  expect(result.type).to.be.equal('client', 'Something is wrong with connection');

  const pingResponse = await trezorController.ping();
  expect(pingResponse.success, 'Ping request is failed').to.be.true;

  const bridgeStartResponse = await trezorController.bridgeStart();
  expect(bridgeStartResponse.success, 'bridge-start request is failed').to.be.true;

  const emulatorStartResponse = await trezorController.emulatorStart();
  expect(emulatorStartResponse.success, 'emulator-start request is failed').to.be.true;

  const emulatorWipeResponse = await trezorController.emulatorWipe();
  expect(emulatorWipeResponse.success, 'emulator-wipe request is failed').to.be.true;

  const emulatorSetupResponse = await trezorController.emulatorSetup(trezorMnemonic);
  expect(emulatorSetupResponse.success, 'emulator-setup request is failed').to.be.true;
};
