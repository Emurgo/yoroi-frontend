// @flow
import { observable, action, toJS } from 'mobx';
import Store from '../base/Store';

import {
  prepareLedgerBridger,
  disposeLedgerBridgeIFrame
} from '../../utils/iframeHandler';

import {
  LedgerBridge,
} from 'yoroi-extension-ledger-bridge';
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
import {
  isTrezorTWallet,
  isLedgerNanoSWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class AddressesStore extends Store {
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError = null;
  @observable selectedAddress: ?{ address: string, path: BIP32Path } = null;

  ledgerBridge: ?LedgerBridge;

  setup() {
    const actions = this.actions[environment.API].hwVerifyAddress;
    actions.selectAddress.listen(this._selectAddress);
    actions.verifyAddress.listen(this._verifyAddress);
    actions.closeAddressDetailDialog.listen(this._closeAddressDetailDialog);
  }

  @action _verifyAddress = async (
    publicDeriver: PublicDeriver,
  ): Promise<void> => {
    Logger.info('AddressStore::_verifyAddress called');

    if (!this.selectedAddress) {
      throw new Error('AddressStore::_verifyAddress called with no address selected');
    }
    // remove null/undefined type to satisfy Flow
    const selectedAddress = this.selectedAddress;
    // need to unwrap observable otherwise bridge will fail
    const path = toJS(selectedAddress.path);
    const address = toJS(selectedAddress.address);

    const conceptualWallet = publicDeriver.getConceptualWallet();

    this._setError(null);
    this._setActionProcessing(true);

    if (isLedgerNanoSWallet(conceptualWallet)) {
      await this.ledgerVerifyAddress(path);
    } else if (isTrezorTWallet(conceptualWallet)) {
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
  ): Promise<void> => {
    if (this.ledgerBridge == null) {
      Logger.info('AddressStore::_verifyAddress new LedgerBridge created');
      this.ledgerBridge = new LedgerBridge();
    }

    try {
      if (this.ledgerBridge) {
        // trick to fix flow
        const ledgerBridge: LedgerBridge = this.ledgerBridge;

        await prepareLedgerBridger(ledgerBridge);
        Logger.info('AddressStore::_verifyAddress show path ' + JSON.stringify(path));
        // the next line is used to get an error when
        // Ledger is not connected or has issues.
        await ledgerBridge.getVersion();
        await ledgerBridge.showAddress(path);
      } else {
        throw new Error(`LedgerBridge Error: LedgerBridge is undefined`);
      }
    } catch (error) {
      Logger.error('AddressStore::ledgerVerifyAddress::error: ' + stringifyError(error));
      this._setError(ledgerErrorToLocalized(error));
    } finally {
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
    this.selectedAddress = null;
    this._setError(null);
    this._setActionProcessing(false);
    disposeLedgerBridgeIFrame();
    this.ledgerBridge = null;
    this.actions.dialogs.closeActiveDialog.trigger();
  }
}
