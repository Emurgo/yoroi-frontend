// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import type { InjectedProps } from '../../types/injectedPropsType';
import AdaRedemptionChoices from '../../components/wallet/ada-redemption/AdaRedemptionChoices';
import type { RedemptionTypeChoices } from '../../types/redemptionTypes';

@inject('stores', 'actions') @observer
export default class AdaRedemptionPage extends Component<InjectedProps> {
  static defaultProps = { actions: null, stores: null };

  render() {
    const { stores, actions } = this.props;

    const { redemptionType } = stores.adaRedemption;
    const { chooseRedemptionType } = actions.ada.adaRedemption;

    const onChooseRedemptionType = (choice) =>
      chooseRedemptionType.trigger({ redemptionType: choice });

    return (
      <div>
        {/* TODO: move this component to Ada Redemption Form once it's created */}
        <AdaRedemptionChoices
          activeChoice={redemptionType}
          onSelectChoice={(choice: RedemptionTypeChoices) => {
            /* TODO: reset form */
            onChooseRedemptionType(choice);
          }}
        />
      </div>
    );
  }
}
