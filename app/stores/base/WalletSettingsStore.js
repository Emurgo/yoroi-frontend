// @flow
import { observable, action } from 'mobx';
import type { Node } from 'react';
import { find, } from 'lodash';
import type { AssuranceMode, } from '../../types/transactionAssuranceTypes';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  ConceptualWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import Store from './Store';

export type PublicDeriverSettingsCache = {|
  publicDeriver: PublicDeriver<>,
  // todo: maybe should be a Request instead of just the result data
  assuranceMode: AssuranceMode,
  publicDeriverName: string,
|};

export type ConceptualWalletSettingsCache = {|
  conceptualWallet: ConceptualWallet,
  // todo: maybe should be a Request instead of just the result data
  conceptualWalletName: string,
|};

export type WarningList = {|
  publicDeriver: PublicDeriver<>,
  // TODO: type for props
  dialogs: Array<void => Node>,
|};

export default class WalletSettingsStore extends Store {

  @observable walletFieldBeingEdited: string | null = null;
  @observable lastUpdatedWalletField: string | null = null;

  @observable publicDeriverSettingsCache: Array<PublicDeriverSettingsCache> = [];
  getPublicDeriverSettingsCache: PublicDeriver<> => PublicDeriverSettingsCache = (
    publicDeriver
  ) => {
    const foundRequest = find(this.publicDeriverSettingsCache, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(WalletSettingsStore)}::${nameof(this.getPublicDeriverSettingsCache)} no settings in cache`);
  }

  @observable conceptualWalletSettingsCache: Array<ConceptualWalletSettingsCache> = [];
  getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache = (
    conceptualWallet
  ) => {
    const foundRequest = find(this.conceptualWalletSettingsCache, { conceptualWallet });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(WalletSettingsStore)}::${nameof(this.conceptualWalletSettingsCache)} no settings in cache`);
  }

  @observable walletWarnings: Array<WarningList> = [];
  getWalletWarnings: PublicDeriver<> => WarningList = (
    publicDeriver
  ) => {
    const foundRequest = find(this.walletWarnings, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(WalletSettingsStore)}::${nameof(this.getWalletWarnings)} no warning list found`);
  }

  @action _startEditingWalletField: {| field: string |} => void = (
    { field }
  ) => {
    this.walletFieldBeingEdited = field;
  };

  @action _stopEditingWalletField: void => void = () => {
    if (this.walletFieldBeingEdited != null) {
      this.lastUpdatedWalletField = this.walletFieldBeingEdited;
    }
    this.walletFieldBeingEdited = null;
  };

  @action _cancelEditingWalletField: void => void = () => {
    this.lastUpdatedWalletField = null;
    this.walletFieldBeingEdited = null;
  };
}
