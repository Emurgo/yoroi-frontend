// @flow
import { observable, action, toJS } from 'mobx';
import Store from '../base/Store';

import {
  prepareLedgerConnect,
} from '../../utils/hwConnectHandler';

import LedgerConnect from '@emurgo/ledger-connect-handler';
import { wrapWithFrame } from '../lib/TrezorWrapper';

import LocalizableError from '../../i18n/LocalizableError';

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
  isLedgerNanoWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { normalizeToAddress, } from '../../api/ada/lib/storage/bridge/utils';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { toTrezorAddressParameters } from '../../api/ada/transactions/shelley/trezorTx';

export default class HWVerifyAddressStore extends Store {
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError = null;
  @observable selectedAddress: ?{|
    address: string,
    path: void | BIP32Path,
  |} = null;
  ledgerConnect: ?LedgerConnect;

  setup(): void {
    super.setup();
    const actions = this.actions.ada.hwVerifyAddress;
    actions.selectAddress.listen(this._selectAddress);
    actions.verifyAddress.listen(this._verifyAddress);
    actions.closeAddressDetailDialog.listen(this._closeAddressDetailDialog);
  }

  @action _verifyAddress: (PublicDeriver<>) => Promise<void> = async (
    publicDeriver,
  ) => {
    Logger.info(`${nameof(HWVerifyAddressStore)}::${nameof(this._verifyAddress)} called`);

    if (!this.selectedAddress) {
      throw new Error(`${nameof(HWVerifyAddressStore)}::${nameof(this._verifyAddress)} called with no address selected`);
    }
    // remove null/undefined type to satisfy Flow
    const selectedAddress = this.selectedAddress;
    // need to unwrap observable otherwise bridge will fail
    const path = toJS(selectedAddress.path);
    const address = toJS(selectedAddress.address);

    const conceptualWallet = publicDeriver.getParent();

    this._setError(null);
    this._setActionProcessing(true);

    if (isLedgerNanoWallet(conceptualWallet)) {
      await this.ledgerVerifyAddress(path, address);
    } else if (isTrezorTWallet(conceptualWallet)) {
      await this.trezorVerifyAddress(path, address, publicDeriver.getParent().getNetworkInfo());
    } else {
      throw new Error(`${nameof(HWVerifyAddressStore)}::${nameof(this._verifyAddress)} called with unrecognized hardware wallet`);
    }

    this._setActionProcessing(false);
  }

  trezorVerifyAddress: (BIP32Path, string, $ReadOnly<NetworkRow>) => Promise<void> = async (
    path,
    address,
    network,
  ): Promise<void> => {
    const config = getCardanoHaskellBaseConfig(network)
      .reduce((acc, next) => Object.assign(acc, next), {});

    const wasmAddr = normalizeToAddress(address);
    if (wasmAddr == null) throw new Error(`${nameof(HWVerifyAddressStore)}::${nameof(this.trezorVerifyAddress)} invalid address ${address}`);
    const addressParams = toTrezorAddressParameters(
      wasmAddr,
      path,
    );
    try {
      await wrapWithFrame(trezor => trezor.cardanoGetAddress({
        protocolMagic: config.ByronNetworkId,
        networkId: Number.parseInt(config.ChainNetworkId, 10),
        addressParameters: addressParams,
      }));
    } catch (error) {
      Logger.error(`${nameof(HWVerifyAddressStore)}::${nameof(this.trezorVerifyAddress)}::error: ` + stringifyError(error));
      this._setError(trezorErrorToLocalized(error));
    } finally {
      Logger.info(`${nameof(HWVerifyAddressStore)}::${nameof(this.trezorVerifyAddress)} finalized`);
    }
  }

  ledgerVerifyAddress: (BIP32Path, string) => Promise<void> = async (
    path: BIP32Path,
    address: string,
  ): Promise<void> => {
    try {
      this.ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale
      });
      await prepareLedgerConnect(this.ledgerConnect);

      Logger.info(`${nameof(HWVerifyAddressStore)}::${nameof(this.ledgerVerifyAddress)} show path ` + JSON.stringify(path));
      if (this.ledgerConnect) {
        await this.ledgerConnect.showAddress(path, address);
      }
    } catch (error) {
      this._setError(ledgerErrorToLocalized(error));
    } finally {
      this.ledgerConnect && this.ledgerConnect.dispose();
      this.ledgerConnect = undefined;
      Logger.info(`${nameof(HWVerifyAddressStore)}::${nameof(this.ledgerVerifyAddress)} finalized`);
    }
  }

  @action _selectAddress: {|
    address: string,
    path: void | BIP32Path,
  |} => Promise<void> = async (params) => {
    Logger.info(`${nameof(HWVerifyAddressStore)}::${nameof(this._selectAddress)} called: ` + params.address);
    this.selectedAddress = { address: params.address, path: params.path };
  }

  @action _setActionProcessing: boolean => void = (processing) => {
    this.isActionProcessing = processing;
  }

  @action _setError: ?LocalizableError => void = (error) => {
    this.error = error;
  }

  @action _closeAddressDetailDialog: void => void = () => {
    this.ledgerConnect && this.ledgerConnect.dispose();
    this.ledgerConnect = undefined;
    this.selectedAddress = null;
    this._setError(null);
    this._setActionProcessing(false);
    this.actions.dialogs.closeActiveDialog.trigger();
  }
}
