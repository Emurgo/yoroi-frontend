// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { InjectedProps } from '../../../types/injectedPropsType';
import EpochProgress from '../../../components/wallet/staking/dashboard/EpochProgress';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';

type Props = {|
  ...InjectedProps,
  +publicDeriver: PublicDeriver<>,
  +showTooltip: boolean,
|};

@observer
export default class EpochProgressContainer extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    const timeStore = this.props.stores.substores.ada.time;
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(EpochProgressContainer)} no public deriver. Should never happen`);
    }
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
    // calculate these so the cached result is available in the render function
    await timeCalcRequests.currentEpochLength.execute().promise;
    await timeCalcRequests.currentSlotLength.execute().promise;
  }

  _leftPadDate: number => string = (num) => {
    if (num < 10) return '0' + num;
    return num.toString();
  };

  render() {
    const timeStore = this.props.stores.substores.ada.time;
    const timeCalcRequests = timeStore.getTimeCalcRequests(this.props.publicDeriver);
    const currTimeRequests = timeStore.getCurrentTimeRequests(this.props.publicDeriver);

    const getEpochLength = timeCalcRequests.currentEpochLength.result;
    if (getEpochLength == null) return (<EpochProgress loading />);

    const getSlotLength = timeCalcRequests.currentSlotLength.result;
    if (getSlotLength == null) return (<EpochProgress loading />);

    const epochLength = getEpochLength();
    const secondsLeftInEpoch = (epochLength - currTimeRequests.currentSlot) * getSlotLength();
    const timeLeftInEpoch = new Date(
      (1000 * secondsLeftInEpoch) - currTimeRequests.msIntoSlot
    );

    return (
      <EpochProgress
        currentEpoch={currTimeRequests.currentEpoch}
        percentage={Math.floor(100 * currTimeRequests.currentSlot / epochLength)}
        endTime={{
          h: this._leftPadDate(timeLeftInEpoch.getUTCHours()),
          m: this._leftPadDate(timeLeftInEpoch.getUTCMinutes()),
          s: this._leftPadDate(timeLeftInEpoch.getUTCSeconds()),
        }}
        showTooltip={this.props.showTooltip}
      />
    );
  }

}
