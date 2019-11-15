// @flow
import { observable, action } from 'mobx';
import BigNumber from 'bignumber.js';
import { assuranceModes, } from '../config/transactionAssuranceConfig';
import type { AssuranceMode, } from '../types/transactionAssuranceTypes';
import type { WalletAccountNumberPlate } from '../api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  PublicDeriver,
} from '../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetSigningKey,
} from '../api/ada/lib/storage/models/Bip44Wallet/traits';
import {
  asGetPublicKey,
} from '../api/ada/lib/storage/models/common/traits';
import { createAccountPlate } from '../api/ada/lib/cardanoCrypto/plate';

export default class PublicDeriverWithCachedMeta {

  @observable self: PublicDeriver<>;
  /**
   * no plate if no public key
   */
  @observable plate: null | WalletAccountNumberPlate;
  @observable publicDeriverName: string;
  @observable conceptualWalletName: string;
  @observable amount: BigNumber;
  @observable assuranceMode: AssuranceMode;
  @observable signingKeyUpdateDate: null | Date;

  constructor(data: {
    self: PublicDeriver<>,
    plate: null | WalletAccountNumberPlate,
    publicDeriverName: string,
    conceptualWalletName: string,
    amount: BigNumber,
    assuranceMode: AssuranceMode,
    signingKeyUpdateDate: null | Date,
  }) {
    Object.assign(this, data);
  }

  @action
  static fromData(data: {
    self: PublicDeriver<>,
    plate: null | WalletAccountNumberPlate,
    publicDeriverName: string,
    conceptualWalletName: string,
    amount: BigNumber,
    assuranceMode: AssuranceMode,
    signingKeyUpdateDate: null | Date,
  }) {
    return new PublicDeriverWithCachedMeta(data);
  }

  static async fromPublicDeriver(
    publicDeriver: PublicDeriver<>,
  ): Promise<PublicDeriverWithCachedMeta> {
    const withPubKey = asGetPublicKey(publicDeriver);

    let plate = null;
    if (withPubKey != null) {
      const publicKey = await withPubKey.getPublicKey();
      if (publicKey.IsEncrypted) {
        throw new Error('fromPublicDeriver unexpected encrypted public key');
      }
      plate = createAccountPlate(publicKey.Hash);
    }

    const publicDeriverInfo = await publicDeriver.getFullPublicDeriverInfo();
    const conceptualWalletInfo = await publicDeriver
      .getParent()
      .getFullConceptualWalletInfo();

    let signingKeyUpdateDate = null;
    {
      const withSigningKey = asGetSigningKey(publicDeriver);
      if (withSigningKey) {
        const key = await withSigningKey.getSigningKey();
        signingKeyUpdateDate = key.row.PasswordLastUpdate;
      }
    }

    return PublicDeriverWithCachedMeta.fromData({
      self: publicDeriver,
      plate,
      publicDeriverName: publicDeriverInfo.Name,
      conceptualWalletName: conceptualWalletInfo.Name,
      amount: new BigNumber(0), // assume 0 for now. Updated later if necessary
      assuranceMode: assuranceModes.NORMAL,
      signingKeyUpdateDate,
    });
  }
}
