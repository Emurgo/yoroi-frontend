// @flow
// Interface of Hardware Wallet Connect dialog

import Wallet from '../domain/Wallet';
import LocalizedRequest from '../stores/lib/LocalizedRequest';

import LocalizableError from '../i18n/LocalizableError';

import type { CreateHardwareWalletRequest, CreateHardwareWalletFunc } from '../api/ada';

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

export interface ProgressInfo {
  currentStep: ProgressStepEnum,
  stepState: StepStateEnum,
}

// Hardware wallet device Features object
export interface HWFeatures {
  vendor: string,
  model: string,
  label: string,
  deviceId: string,
  language: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
}

export interface HWDeviceInfo {
  publicMasterKey: string,
  hwFeatures: HWFeatures
}

export interface HWConnectStoreTypes {
  // =================== VIEW RELATED =================== //
  /** the only observable which manages state change */
  progressInfo: ProgressInfo;

  /** only in ERROR state it will hold LocalizableError object */
  error: ?LocalizableError;

  /** device info which will be used to create wallet (except wallet name)
    * it also holds hardware device label which can used as default wallet name
    * although final wallet name will be fetched from the user */
  hwDeviceInfo: ?HWDeviceInfo;

  /** Hardware device label to be used as default wallet name
    * although user can opt to use user give name */
  get defaultWalletName(): string;

  get isActionProcessing(): boolean;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createHWRequest: LocalizedRequest<CreateHardwareWalletFunc>;

  /** While hardware wallet creation is taking place, we need to block users from starting a
    * hardware wallet creation on a seperate wallet and explain to them why the action is blocked */
  isCreateHWActive: boolean;
  // =================== API RELATED =================== //

  setup(): void;

  /** setup() is called when stores are being created
    * _init() is called when connect dailog is about to show */
  _init(): void;

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

  /** Validates the compatibility of data which we have received from hardware wallet */
  _validateHWResponse(any, any): boolean;

  /** Converts a valid hardware wallet response to a common storable format
    * later the same format will be used to create wallet */
  _normalizeHWResponse(any, any): HWDeviceInfo;
  // =================== CONNECT =================== //

  // =================== SAVE =================== //
  _goToSaveLoad(): void;

  /** SAVE dialog submit (Save button) */
  _submitSave(walletName: string): void;

  _goToSaveError(): void;

  /** creates new wallet and loads it */
  _saveHW(walletName: string): Promise<void>;

  _prepareCreateHWReqParams(walletName: string): CreateHardwareWalletRequest;

  _onSaveSucess(hwWallet: Wallet): Promise<void>;
  // =================== SAVE =================== //

  // =================== API =================== //
  _setIsCreateHWActive(active: boolean): void;
  // =================== API =================== //
}
