// @flow
import { action, observable } from 'mobx';
import Store from './lib/Store';
import { ADA_REDEMPTION_TYPES } from '../types/redemptionTypes';
import type { RedemptionTypeChoices } from '../types/redemptionTypes';

export default class AdaRedemptionStore extends Store {

  @observable redemptionType: RedemptionTypeChoices = ADA_REDEMPTION_TYPES.REGULAR;

  setup() {
    const actions = this.actions.ada.adaRedemption;
    actions.chooseRedemptionType.listen(this._chooseRedemptionType);
  }

  @action _chooseRedemptionType = (params: {
    redemptionType: RedemptionTypeChoices,
  }) => {
    if (this.redemptionType !== params.redemptionType) {
      this._reset();
      this.redemptionType = params.redemptionType;
    }
  };

  @action _reset = () => {
    this.redemptionType = ADA_REDEMPTION_TYPES.REGULAR;
  };

}
