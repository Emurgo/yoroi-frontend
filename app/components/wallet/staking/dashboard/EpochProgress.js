// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Card from './Card';
import Tooltip from './Tooltip';
import ProgressCircle from './ProgressCircle';
import styles from './EpochProgress.scss';
import globalMessages from '../../../../i18n/global-messages';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.epochProgress',
    defaultMessage: '!!!Epoch progress',
  },
  tooltip: {
    id: 'wallet.dashboard.epochTooltip',
    defaultMessage: '!!!Note: only to receive the first reward will take longer then 1 epoch, after you will receive rewards every next epoch.'
  },
  endTitle: {
    id: 'wallet.dashboard.epochEndTitle',
    defaultMessage: '!!!Time until Epoch end',
  },
});

type Props = {|
  percentage: number,
  currentEpoch: number,
  endTime?: Object,
|};

@observer
export default class EpochProgress extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    endTime: null
  }

  render() {
    const { intl } = this.context;
    const { percentage, endTime, currentEpoch } = this.props;

    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={styles.wrapper}>
          <div className={styles.chart}>
            <ProgressCircle percentage={percentage} variant="epoch" />
          </div>
          <div className={styles.stats}>
            <div>
              <p className={classnames(styles.label, styles.dashed)}>
                {intl.formatMessage(globalMessages.epochLabel)}:
              </p>
              <p className={styles.value}>{currentEpoch}</p>
            </div>
            {endTime && (
              <div className={styles.row}>
                <p className={styles.label}>{intl.formatMessage(messages.endTitle)}:</p>
                <div className={styles.value}>
                  <p>
                    <span className={styles.timeBlock}>{endTime.h}</span>
                    :
                    <span className={styles.timeBlock}>{endTime.m}</span>
                    :
                    <span className={styles.timeBlock}>{endTime.s}</span>
                  </p>
                  <div className={styles.tooltip}>
                    <Tooltip text={intl.formatMessage(messages.tooltip)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

}
