import { expect } from 'chai';
import { TrezorEmulatorController } from './trezorEmulatorController.js';
import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';

export const TrezorModels = Object.freeze({
  ModelT: 'T2T1',
  Safe3: 'T2B1',
  Safe5: 'T3T1',
});

/**
 * Setting up the trezor emulator.
 * @param {TrezorEmulatorController} trezorController Trezor emulator controller object
 * @param {string} trezorMnemonic 12-word mnemonic seed phrase of a wallet
 */
export const runAndPrepareTrezor = async (
  trezorController,
  trezorMnemonic,
  trezorModel = TrezorModels.ModelT
) => {
  await trezorController.connect();
  const result = await trezorController.getLastEvent();
  expect(result.type).to.be.equal('client', 'Something is wrong with connection');

  const pingResponse = await trezorController.ping();
  expect(pingResponse.success, 'Ping request is failed').to.be.true;

  const bridgeStartResponse = await trezorController.bridgeStart();
  expect(bridgeStartResponse.success, 'bridge-start request is failed').to.be.true;

  const emulatorStartResponse = await trezorController.emulatorStart(trezorModel);
  expect(emulatorStartResponse.success, 'emulator-start request is failed').to.be.true;

  const emulatorWipeResponse = await trezorController.emulatorWipe();
  expect(emulatorWipeResponse.success, 'emulator-wipe request is failed').to.be.true;

  const emulatorSetupResponse = await trezorController.emulatorSetup(trezorMnemonic);
  expect(emulatorSetupResponse.success, 'emulator-setup request is failed').to.be.true;
};

/**
 * Converting screens content to address, derivationPath, stakingKeyHash
 * @param {Array<string>} trezorScreensContent
 * @returns {{addressFull: string, derivationPath: string, stakingKeyHash: string}}
 */
export const convertExportResponse = trezorScreensContent => {
  expect(
    trezorScreensContent.length,
    'Trezor screens contents amount is different from expected'
  ).to.equal(3);
  const derivationPath = trezorScreensContent[0].split(':')[1].trim().replace(/ /g, '');
  const stakingKeyHash = trezorScreensContent[1].split(':')[1].trim().replace(/ /g, '');
  const addressFull = trezorScreensContent[2].trim().replace(/ /g, '');
  return {
    addressFull,
    derivationPath,
    stakingKeyHash,
  };
};

export const getStakeBeck32KeyFromKeyHash = stakeKeyHash =>
  CSL.Ed25519KeyHash.from_hex(stakeKeyHash).to_bech32('stake_vkh');
