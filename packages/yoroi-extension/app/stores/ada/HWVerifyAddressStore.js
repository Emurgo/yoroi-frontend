// @flow
import { observable, action, toJS } from 'mobx';
import Store from '../base/Store';
import { LedgerConnect } from '../../utils/hwConnectHandler';
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
import { normalizeToAddress, } from '../../api/ada/lib/storage/bridge/utils';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import {
  getNetworkById,
  getCardanoHaskellBaseConfig,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { toTrezorAddressParameters } from '../../api/ada/transactions/shelley/trezorTx';
import { toLedgerAddressParameters } from '../../api/ada/transactions/shelley/ledgerTx';
import type { StandardAddress } from '../../types/AddressFilterTypes';
import { genAddressingLookup } from '../stateless/addressStores';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { WalletState } from '../../../chrome/extension/background/types';

export default class HWVerifyAddressStore extends Store<StoresMap, ActionsMap> {
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError = null;
  @observable selectedAddress: ?$ReadOnly<StandardAddress> = null;
  ledgerConnect: ?LedgerConnect;

  setup(): void {
    super.setup();
    const actions = this.actions.ada.hwVerifyAddress;
    actions.selectAddress.listen(this._selectAddress);
    actions.verifyAddress.listen(this._verifyAddress);
    actions.closeAddressDetailDialog.listen(this._closeAddressDetailDialog);
  }

  @action _verifyAddress: (WalletState) => Promise<void> = async (
    wallet,
  ) => {
    Logger.info(`${nameof(HWVerifyAddressStore)}::${nameof(this._verifyAddress)} called`);

    if (!this.selectedAddress) {
      throw new Error(`${nameof(HWVerifyAddressStore)}::${nameof(this._verifyAddress)} called with no address selected`);
    }
    // remove null/undefined type to satisfy Flow
    const selectedAddress = this.selectedAddress;
    if (!selectedAddress.addressing) {
      throw new Error(`${nameof(HWVerifyAddressStore)}::${nameof(this._verifyAddress)} called with no addressing information`);
    }

    // need to unwrap observable otherwise bridge will fail
    const path = toJS(selectedAddress.addressing.path);
    const address = toJS(selectedAddress.address);

    this._setError(null);
    this._setActionProcessing(true);

    if (wallet.type === 'ledger') {
      await this.ledgerVerifyAddress(path, address, wallet);
    } else if (wallet.type === 'trezor') {
      await this.trezorVerifyAddress(path, address, getNetworkById(wallet.networkId));
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

  ledgerVerifyAddress: (BIP32Path, string, WalletState) => Promise<void> = async (
    path,
    expectedAddr,
    wallet,
  ) => {
    try {
      this.ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale,
      });

      Logger.info(`${nameof(HWVerifyAddressStore)}::${nameof(this.ledgerVerifyAddress)} show path ` + JSON.stringify(path));

      const config = getCardanoHaskellBaseConfig(
        getNetworkById(wallet.networkId)
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const wasmAddr = normalizeToAddress(expectedAddr);
      if (wasmAddr == null) throw new Error(`${nameof(HWVerifyAddressStore)}::${nameof(this.ledgerVerifyAddress)} invalid address ${expectedAddr}`);
      const addressParams = toLedgerAddressParameters({
        address: wasmAddr,
        path,
        networkId: Number.parseInt(config.ChainNetworkId, 10),
        addressingMap: genAddressingLookup(wallet.networkId, this.stores.addresses.addressSubgroupMap),
      });

      const expectedSerial = wallet.hardwareWalletDeviceId || '';
      if (this.ledgerConnect) {
        await this.ledgerConnect.showAddress({
          params: {
            expectedAddr,
            address: addressParams,
            network: {
              networkId: Number.parseInt(config.ChainNetworkId, 10),
              protocolMagic: config.ByronNetworkId,
            }
          },
          serial: expectedSerial,
        });
      }
    } catch (error) {
      this._setError(ledgerErrorToLocalized(error));
    } finally {
      if (this.ledgerConnect != null) {
        this.ledgerConnect.dispose();
      }
      this.ledgerConnect = undefined;
      Logger.info(`${nameof(HWVerifyAddressStore)}::${nameof(this.ledgerVerifyAddress)} finalized`);
    }
  }

  @action _selectAddress: $ReadOnly<StandardAddress> => Promise<void> = async (params) => {
    Logger.info(`${nameof(HWVerifyAddressStore)}::${nameof(this._selectAddress)} called: ` + params.address);
    this.selectedAddress = params;
  }

  @action _setActionProcessing: boolean => void = (processing) => {
    this.isActionProcessing = processing;
  }

  @action _setError: ?LocalizableError => void = (error) => {
    this.error = error;
  }

  @action _closeAddressDetailDialog: void => void = () => {
    if (this.ledgerConnect != null) {
      this.ledgerConnect.dispose();
    }
    this.ledgerConnect = undefined;
    this.selectedAddress = null;
    this._setError(null);
    this._setActionProcessing(false);
    this.actions.dialogs.closeActiveDialog.trigger();
  }
}
