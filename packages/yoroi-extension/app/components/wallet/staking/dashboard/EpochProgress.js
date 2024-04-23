// @flow
import { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Card from './CardShadow';
import FirstRewardTooltip from './FirstRewardTooltip';
import ProgressCircle from './ProgressCircle';
import styles from './EpochProgress.scss';
import globalMessages from '../../../../i18n/global-messages';

import LoadingSpinner from '../../../widgets/LoadingSpinner';
import Timer from '../../../widgets/Timer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.epochProgress',
    defaultMessage: '!!!Epoch progress',
  },
  tooltip: {
    id: 'wallet.dashboard.epochTooltip',
    defaultMessage: '!!!Note: only the first reward after delegating will take {numEpochs} epochs. Afterwards, rewards come every epoch.'
  },
  endTitle: {
    id: 'wallet.dashboard.epochEndTitle',
    defaultMessage: '!!!Time until Epoch end',
  },
});


type Props = {|
  +loading: true,
|} | {|
  +percentage: number,
  +currentEpoch: number,
  +endTime: {|
    d?: string,
    h: string,
    m: string,
    s: string,
  |},
  +useEndOfEpoch: boolean,
  +showTooltip: boolean,
|};

@observer
export default class EpochProgress extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={styles.wrapper}>
          {this.getContent()}
        </div>
      </Card>
    );
  }

  getContent: void => Node = () => {
    if (this.props.loading) {
      return <LoadingSpinner />;
    }
    const { percentage, endTime, currentEpoch } = this.props;
    const { intl } = this.context;

    return (
      <>
        <div className={styles.chart}>
          <ProgressCircle percentage={percentage} variant="epoch" />
        </div>
        <div className={styles.stats}>
          <div>
            <div className={classnames(styles.label, styles.dashed)}>
              {intl.formatMessage(globalMessages.epochLabel)}:
            </div>
            <div className={styles.value}>{currentEpoch}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>{intl.formatMessage(messages.endTitle)}:</div>
            <div className={styles.value}>
              <div className={styles.timer}><Timer time={endTime} /></div>
              {this.props.showTooltip === true && (
                <div className={styles.tooltip}>
                  <FirstRewardTooltip
                    text={intl.formatMessage(messages.tooltip, {
                      numEpochs: this.props.useEndOfEpoch === true
                        ? 3
                        : 2
                    })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}
