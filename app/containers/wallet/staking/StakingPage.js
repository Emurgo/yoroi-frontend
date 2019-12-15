// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SeizaFetcher from './SeizaFetcher';
import InformativeError from '../../../components/widgets/InformativeError';
import VerticallyCenteredLayout from '../../../components/layout/VerticallyCenteredLayout';

import type { InjectedProps } from '../../../types/injectedPropsType';

type Props = {|
  ...InjectedProps,
  stakingUrl: string,
|};

const messages = defineMessages({
  title: {
    id: 'wallet.staking.warning.title',
    defaultMessage: '!!!Delegation temporarily disabled',
  },
  pendingTxWarning: {
    id: 'wallet.staking.warning.pendingTx',
    defaultMessage: '!!!You cannot change your delegation preference while a transaction is pending',
  },
});

@observer
export default class StakingPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { stores } = this.props;
    const { intl } = this.context;

    return this.props.stores.substores.ada.transactions.hasAnyPending
      ? (
        <VerticallyCenteredLayout>
          <InformativeError
            title={intl.formatMessage(messages.title)}
            text={intl.formatMessage(messages.pendingTxWarning)}
          />
        </VerticallyCenteredLayout>
      )
      : (<SeizaFetcher {...this.props} stores={stores} stakingUrl={this.props.stakingUrl} />);
  }
}
