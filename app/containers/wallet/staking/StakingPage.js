// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SeizaFetcher from './SeizaFetcher';
import InformativeError from '../../../components/widgets/InformativeError';
import VerticallyCenteredLayout from '../../../components/layout/VerticallyCenteredLayout';
import { formattedAmountWithoutLovelace } from '../../../utils/formatters';
import environment from '../../../environment';

import type { InjectedProps } from '../../../types/injectedPropsType';

type Props = {|
  ...InjectedProps,
  urlTemplate: string,
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

  prepareStakingURL(): string {
    let finalURL = this.props.urlTemplate
      .replace(
        '$$BROWSER$$',
        environment.userAgentInfo.isFirefox
          ? 'firefox'
            // $FlowFixMe
          : 'chrome&chromeId=' + chrome.runtime.id,
      );

    // Add userAda
    const publicDeriver = this.props.stores.substores.ada.wallets.selected;
    if (publicDeriver) {
      // Seiza does not understand decimal places, so removing all Lovelaces
      finalURL += `&userAda=${formattedAmountWithoutLovelace(publicDeriver.amount)}`;
    }

    return finalURL;
  }

  render() {
    const { actions, stores } = this.props;
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
      : (<SeizaFetcher actions={actions} stores={stores} stakingUrl={this.prepareStakingURL()} />);
  }
}
