// @flow

import { observable, action } from 'mobx';

import Config from '../config';
import environment from '../environment';

import Store from '../stores/base/Store';
import Wallet from '../domain/Wallet';
import LocalizedRequest from '../stores/lib/LocalizedRequest';

import LocalizableError, { UnexpectedError } from '../i18n/LocalizableError';

import type { DeviceMessage, Features, UiMessage } from 'trezor-connect';

export type ProgressStepEnum = 0 | 1 | 2;
export const ProgressStep = {
  ABOUT: 0,
  CONNECT: 1,
  SAVE: 2,
};

export type StepStateEnum = 0 | 1 | 9;
export const StepState = {
  LOAD: 0,
  PROCESS: 1,
  ERROR: 9,
};

export type ProgressInfo = {
  currentStep: ProgressStepEnum,
  stepState: StepStateEnum,
};

interface HWFeatures {
  vendor: string,
  major_version: number,
  minor_version: number,
  patch_version: number,
} 

// TODO: this could be better with generics, but flow goes crazy.
export type HWDeviceInfo = {
  valid: boolean,
  publicKey: ?string,
  // Ledger device Features object
  features: ?HWFeatures
};

export interface HWConnectStoreTypes {
  // =================== VIEW RELATED =================== //
  /** the only observable which manages state change */
  // TODO: improve any to something that fits: @observable progressInfo: ProgressInfo;
  progressInfo: any;

  /** only in ERROR state it will hold LocalizableError object */
  error: ?LocalizableError;

  get isActionProcessing(): boolean;

  /** device info which will be used to create wallet (except wallet name)
    * also it holds Ledger device label which is used as default wallet name
    * final wallet name will be fetched from the user */
  HWDeviceInfo: ?HWDeviceInfo;

  // Ledger device label
  get defaultWalletName(): string;

  /** holds Ledger device DeviceMessage event object, device features will be fetched
    * from this object and will be cloned to HWDeviceInfo object */

  HWEventDevice?: ?DeviceMessage | any; // TODO: This seems to not apply to Ledger

  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  // TODO: add later
  createWalletRequest: LocalizedRequest<any>;

  /** While ledger wallet creation is taking place, we need to block users from starting a
    * trezor wallet creation on a seperate wallet and explain to them why the action is blocked */
  isCreateWalletActive: boolean;
  // =================== API RELATED =================== //

  setup(): void;

  teardown(): void;

  _reset(): void;

  _cancel(): void;

  // =================== ABOUT =================== //
  /** ABOUT dialog submit(Next button) */
  _submitAbout(): void;
  // =================== ABOUT =================== //

  // =================== CONNECT =================== //
  /** CONNECT dialog goBack button */
  _goBackToAbout(): void;

  /** CONNECT dialog submit (Connect button) */
  _submitConnect(): void;

  _goToConnectError(): void;

  _checkAndStoreHWDeviceInfo(): Promise<void>;

  _addHWConnectEventListeners(): void;

  _removeHWConnectEventListeners(): void;

  _onHWDeviceEvent?: (event: DeviceMessage | any) => void;

  _onHWUIEvent?: (event: UiMessage | any) => void;

  /** Validates the compatibility of data which we have received from Trezor */
  _validateResponse(): void;
  // =================== CONNECT =================== //

  // =================== SAVE =================== //
  _goToSaveLoad(): void;

  /** SAVE dialog submit (Save button) */
  _submitSave(walletName: string): void;

  _goToSaveError(): void;

  /** creates new wallet and loads it */
  _saveHW(params: {
    publicMasterKey: string,
    walletName: string,
    deviceFeatures: Features,
  }): Promise<void>;

  _onSaveSucess(HWWallet: Wallet): void;
  // =================== SAVE =================== //

  // =================== API =================== //
  _setIsCreateHWActive(active: boolean): void;
  // // =================== API =================== //
}
