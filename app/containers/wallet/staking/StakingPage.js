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
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';

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

/*::
declare var chrome;
*/

@observer
export default class StakingPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  getBrowserReplacement(): string {
    if (environment.userAgentInfo.isFirefox) {
      return 'firefox';
    }
    // otherwise assume Chrome
    if (environment.userAgentInfo.isExtension) {
      return 'chrome&chromeId=' + chrome.runtime.id;
    }
    // return 'chrome';
    throw new Error('TODO: support staking page on browser builds');
  }

  prepareStakingURL(): null | string {
    let finalURL = this.props.urlTemplate
      .replace(
        '$$BROWSER$$',
        this.getBrowserReplacement()
      );

    // Add userAda
    const publicDeriver = this.props.stores.substores.ada.wallets.selected;
    if (!publicDeriver) {
      return null;
    }
    // Seiza does not understand decimal places, so removing all Lovelaces
    finalURL += `&userAda=${formattedAmountWithoutLovelace(publicDeriver.amount)}`;

    const delegation = this.props.stores.substores.ada.delegation.stakingKeyState;
    if (!delegation) {
      return null;
    }
    const poolList = Array.from(
      new Set(delegation.state.delegation.pools.map(pool => pool[0]))
    );
    finalURL += `&delegated=${encodeURIComponent(JSON.stringify(poolList))}`;
    return finalURL;
  }

  render() {
    const { actions, stores } = this.props;
    const { intl } = this.context;

    if (this.props.stores.substores.ada.transactions.hasAnyPending) {
      return (
        <VerticallyCenteredLayout>
          <InformativeError
            title={intl.formatMessage(messages.title)}
            text={intl.formatMessage(messages.pendingTxWarning)}
          />
        </VerticallyCenteredLayout>
      );
    }

    const url = this.prepareStakingURL();
    if (url == null) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }
    return (<SeizaFetcher actions={actions} stores={stores} stakingUrl={url} />);
  }
}
