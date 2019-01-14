// @flow
import { action, observable } from 'mobx';
import Store from '../base/Store';
import { ADA_REDEMPTION_TYPES } from '../../types/redemptionTypes';
import type { RedemptionTypeChoices } from '../../types/redemptionTypes';

export default class AdaRedemptionStore extends Store {

  @observable redemptionType: RedemptionTypeChoices = ADA_REDEMPTION_TYPES.REGULAR;
  @observable redemptionCode: string = '';

  setup() {
    const actions = this.actions.ada.adaRedemption;
    actions.chooseRedemptionType.listen(this._chooseRedemptionType);
    actions.setRedemptionCode.listen(this._setRedemptionCode);
  }

  @action _chooseRedemptionType = (params: {
    redemptionType: RedemptionTypeChoices,
  }) => {
    if (this.redemptionType !== params.redemptionType) {
      this._reset();
      this.redemptionType = params.redemptionType;
    }
  };

  _setRedemptionCode = action(({ redemptionCode }: { redemptionCode: string }) => {
    this.redemptionCode = redemptionCode;
  });

  @action _reset = () => {
    this.redemptionType = ADA_REDEMPTION_TYPES.REGULAR;
    this.redemptionCode = '';
  };

}
