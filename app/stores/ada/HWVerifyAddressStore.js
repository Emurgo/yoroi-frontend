// @flow
import { observable, action, toJS } from 'mobx';
import { defineMessages } from 'react-intl';
import Store from '../base/Store';

import {
  prepareLedgerBridger,
  disposeLedgerBridgeIFrame
} from '../../utils/iframeHandler';

import {
  LedgerBridge,
} from 'yoroi-extension-ledger-bridge';

import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';
import environment from '../../environment';

import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import {
  Logger,
  stringifyError,
  // stringifyData,
} from '../../utils/logging';

import Wallet from '../../domain/Wallet';

const messages = defineMessages({
  signTxError101: {
    id: 'wallet.send.ledger.error.101',
    defaultMessage: '!!!Signing cancelled on Ledger device. Please retry or reconnect device.',
  },
});

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

  @action _verifyAddress = async (params: { wallet: Wallet }): Promise<void> => {
    Logger.info('AddressStore::_verifyAddress called');

    if (!this.selectedAddress) {
      throw new Error('AddressStore::_verifyAddress called with no address selected');
    }
    // need to unwrap observable otherwise bridge will fail
    const path = toJS(this.selectedAddress.path);

    if (!params.wallet.hardwareInfo) {
      throw new Error('AddressStore::_verifyAddress called with no hardware wallet active');
    }

    this._setError(null);
    this._setActionProcessing(true);

    try {
      // TODO: don't use hardcoded strings and maybe find a better way to do this?
      if (params.wallet.hardwareInfo.vendor === 'ledger.com') {
        await this.ledgerVerifyAddress(path);
      } else if (params.wallet.hardwareInfo.vendor === 'trezor.io') {
        // not implemented yet
        await this.trezorVerifyAddress(path);
      } else {
        throw new Error('AddressStore::_verifyAddress called with unrecognized hardware wallet');
      }
    } catch (error) {
      Logger.error('AddressStore::_verifyAddress::error: ' + stringifyError(error));
      this._setError(this._convertToLocalizableError(error));
    } finally {
      this._setActionProcessing(false);
    }
  }

  trezorVerifyAddress = async (
    path: BIP32Path
  ): Promise<void> => {
    /**
     * NOT IMPLEMENTED YET
     */
    throw new Error('AddressStore::_verifyAddress::Trezor not implemented yet');
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
        await ledgerBridge.showAddress(path);
      } else {
        throw new Error(`LedgerBridge Error: LedgerBridge is undefined`);
      }
    } finally {
      Logger.info('HWVerifyStore::ledgerVerifyAddress finalized ');
    }
  }

  /**
   * TODO: This needs to be moved to a single file (also from LedgerSendStore)
   */

  /** Converts error(from API or Ledger API) to LocalizableError */
  _convertToLocalizableError = (error: any): LocalizableError => {
    let localizableError: ?LocalizableError = null;

    if (error instanceof LocalizableError) {
      // It means some API Error has been thrown
      localizableError = error;
    } else if (error && error.message) {
      // Ledger device related error happend, convert then to LocalizableError
      switch (error.message) {
        case 'TransportError: Failed to sign with Ledger device: U2F TIMEOUT':
          localizableError = new LocalizableError(globalMessages.ledgerError101);
          break;
        case 'TransportStatusError: Ledger device: Action rejected by user':
          localizableError = new LocalizableError(messages.signTxError101);
          break;
        default:
          /** we are not able to figure out why Error is thrown
            * make it, Something unexpected happened */
          Logger.error(`LedgerSendStore::_convertToLocalizableError::error: ${error.message}`);
          localizableError = new UnexpectedError();
          break;
      }
    }

    if (!localizableError) {
      /** we are not able to figure out why Error is thrown
        * make it, Something unexpected happened */
      localizableError = new UnexpectedError();
    }

    return localizableError;
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
    this.actions.dialogs.closeActiveDialog.trigger();
  }
}
