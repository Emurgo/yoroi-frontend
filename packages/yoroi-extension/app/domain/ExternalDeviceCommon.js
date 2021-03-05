// @flow

import { defineMessages } from 'react-intl';
import LocalizableError from '../i18n/LocalizableError';

const errors = defineMessages({
  incorrectDevice: {
    id: 'wallet.hw.incorrectDevice',
    defaultMessage: '!!!Incorrect device detected. Expected device {expectedDeviceId}, but got device {responseDeviceId}. Please plug in the correct device',
  },
  incorrectVersion: {
    id: 'wallet.hw.incorrectVersion',
    defaultMessage: '!!!Incorrect device version detected. We support version {supportedVersions} but you have version {responseVersion}.',
  },
});


export class IncorrectDeviceError extends LocalizableError {
  constructor(values: {|
    expectedDeviceId: string,
    responseDeviceId: string,
  |}) {
    super({
      id: errors.incorrectDevice.id,
      defaultMessage: errors.incorrectDevice.defaultMessage || '',
      values
    });
  }
}

export class IncorrectVersionError extends LocalizableError {
  constructor(values: {|
    supportedVersions: string,
    responseVersion: string,
  |}) {
    super({
      id: errors.incorrectVersion.id,
      defaultMessage: errors.incorrectVersion.defaultMessage || '',
      values
    });
  }
}
