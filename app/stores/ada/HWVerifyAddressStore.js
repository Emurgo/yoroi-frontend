// @flow
import { observable, action, toJS } from 'mobx';
import Store from '../base/Store';

import {
  prepareLedgerConnect,
} from '../../utils/hwConnectHandler';

import LedgerConnect from 'yoroi-extension-ledger-connect-handler';
import TrezorConnect from 'trezor-connect';

import LocalizableError from '../../i18n/LocalizableError';

import environment from '../../environment';

import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import {
  Logger,
  stringifyError,
} from '../../utils/logging';

import {
  convertToLocalizableError as ledgerErrorToLocalized
} from '../../domain/LedgerLocalizedError';
import {
  convertToLocalizableError as trezorErrorToLocalized
} from '../../domain/TrezorLocalizedError';

import Wallet from '../../domain/Wallet';

export default class AddressesStore extends Store {
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError = null;
  @observable selectedAddress: ?{ address: string, path: BIP32Path } = null;
  ledgerConnect: ?LedgerConnect;

  setup() {
    const actions = this.actions[environment.API].hwVerifyAddress;
    actions.selectAddress.listen(this._selectAddress);
    actions.verifyAddress.listen(this._verifyAddress);
    actions.closeAddressDetailDialog.listen(this._closeAddressDetailDialog);
  }

  @action _verifyAddress = async (params: { wallet: Wallet }): Promise<void> => {
    Logger.info('AddressStore::_verifyAddress called');

    if (!this.selectedAddress) {
      throw new Error('AddressStore::_verifyAddress called with no address selected');
    }
    // remove null/undefined type to satisfy Flow
    const selectedAddress = this.selectedAddress;
    // need to unwrap observable otherwise bridge will fail
    const path = toJS(selectedAddress.path);
    const address = toJS(selectedAddress.address);

    if (!params.wallet.hardwareInfo) {
      throw new Error('AddressStore::_verifyAddress called with no hardware wallet active');
    }

    this._setError(null);
    this._setActionProcessing(true);

    if (params.wallet.isLedgerNanoWallet) {
      await this.ledgerVerifyAddress(path, address);
    } else if (params.wallet.isTrezorTWallet) {
      await this.trezorVerifyAddress(path, address);
    } else {
      throw new Error('AddressStore::_verifyAddress called with unrecognized hardware wallet');
    }

    this._setActionProcessing(false);
  }

  trezorVerifyAddress = async (
    path: BIP32Path,
    address: string
  ): Promise<void> => {
    try {
      await TrezorConnect.cardanoGetAddress({
        path,
        address,
      });
    } catch (error) {
      Logger.error('AddressStore::trezorVerifyAddress::error: ' + stringifyError(error));
      this._setError(trezorErrorToLocalized(error));
    } finally {
      Logger.info('HWVerifyStore::trezorVerifyAddress finalized ');
    }
  }

  ledgerVerifyAddress = async (
    path: BIP32Path,
    address: string,
  ): Promise<void> => {
    try {
      // trick to fix flow
      this.ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale
      });
      await prepareLedgerConnect(this.ledgerConnect);

      Logger.info('AddressStore::_verifyAddress show path ' + JSON.stringify(path));
      if (this.ledgerConnect) {
        await this.ledgerConnect.showAddress(path, address);
      }
    } catch (error) {
      this._setError(ledgerErrorToLocalized(error));
    } finally {
      this.ledgerConnect && this.ledgerConnect.dispose();
      this.ledgerConnect = undefined;
      Logger.info('HWVerifyStore::ledgerVerifyAddress finalized ');
    }
  }

  @action _selectAddress = async (params: { address: string, path: BIP32Path }): Promise<void> => {
    Logger.info('AddressStore::_selectAddress::called: ' + params.address);
    this.selectedAddress = { address: params.address, path: params.path };
  }

  @action _setActionProcessing = (processing: boolean): void => {
    this.isActionProcessing = processing;
  }

  @action _setError = (error: ?LocalizableError): void => {
    this.error = error;
  }

  @action _closeAddressDetailDialog = (): void => {
    this.ledgerConnect && this.ledgerConnect.dispose();
    this.ledgerConnect = undefined;
    this.selectedAddress = null;
    this._setError(null);
    this._setActionProcessing(false);
    this.actions.dialogs.closeActiveDialog.trigger();
  }
}
