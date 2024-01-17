// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { StoresAndActionsProps } from '../../../types/injectedPropsType';
import EpochProgress from '../../../components/wallet/staking/dashboard/EpochProgress';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  ...StoresAndActionsProps,
  +publicDeriver: PublicDeriver<>,
  +showTooltip: boolean,
|};

@observer
export default class EpochProgressContainer extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    const timeStore = this.props.stores.substores.ada.time;
    if (this.props.publicDeriver == null) {
      throw new Error(`${nameof(EpochProgressContainer)} no public deriver. Should never happen`);
    }
    const timeCalcRequests = timeStore.getTimeCalcRequests(this.props.publicDeriver);
    // calculate these so the cached result is available in the render function
    await timeCalcRequests.requests.currentEpochLength.execute().promise;
    await timeCalcRequests.requests.currentSlotLength.execute().promise;
  }

  _leftPadDate: number => string = (num) => {
    if (num < 10) return '0' + num;
    return num.toString();
  };

  render(): Node {
    const timeStore = this.props.stores.substores.ada.time;
    const timeCalcRequests = timeStore.getTimeCalcRequests(this.props.publicDeriver);
    const currTimeRequests = timeStore.getCurrentTimeRequests(this.props.publicDeriver);

    const getEpochLength = timeCalcRequests.requests.currentEpochLength.result;
    if (getEpochLength == null) return (<EpochProgress loading />);

    const getSlotLength = timeCalcRequests.requests.currentSlotLength.result;
    if (getSlotLength == null) return (<EpochProgress loading />);

    const epochLength = getEpochLength();
    const secondsLeftInEpoch = (epochLength - currTimeRequests.currentSlot) * getSlotLength();
    const timeLeftInEpoch = new Date(
      (1000 * secondsLeftInEpoch) - currTimeRequests.msIntoSlot
    );

    // only show a days column if there can be one in the first place
    const hasDays = new Date(
      (1000 * epochLength * getSlotLength()) - currTimeRequests.msIntoSlot
    ).getUTCDate() > 1;

    return (
      <EpochProgress
        currentEpoch={currTimeRequests.currentEpoch}
        percentage={Math.floor(100 * currTimeRequests.currentSlot / epochLength)}
        endTime={{
          d: hasDays
            ? this._leftPadDate(timeLeftInEpoch.getUTCDate() - 1)
            : undefined,
          h: this._leftPadDate(timeLeftInEpoch.getUTCHours()),
          m: this._leftPadDate(timeLeftInEpoch.getUTCMinutes()),
          s: this._leftPadDate(timeLeftInEpoch.getUTCSeconds()),
        }}
        showTooltip={this.props.showTooltip}
        useEndOfEpoch
      />
    );
  }
}
