// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import SeizaFetcher from './SeizaFetcher';
import type { GeneratedData as SeizaFetcherData } from './SeizaFetcher';
import InformativeError from '../../../components/widgets/InformativeError';
import VerticallyCenteredLayout from '../../../components/layout/VerticallyCenteredLayout';
import { formattedAmountWithoutLovelace } from '../../../utils/formatters';
import environment from '../../../environment';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { DelegationRequests } from '../../../stores/ada/DelegationStore';
import type { TxRequests } from '../../../stores/toplevel/TransactionsStore';
import { getApiForCoinType, getApiMeta } from '../../../api/common/utils';

export type GeneratedData = typeof StakingPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
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
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    this.generated.actions.ada.delegationTransaction.reset.trigger();
  }

  getBrowserReplacement(): string {
    // 1) handle Yoroi running as an extension

    if (environment.userAgentInfo.isExtension) {
      if (environment.userAgentInfo.isFirefox) {
        return 'firefox&mozId=' + location.hostname;
      }
      // otherwise assume Chrome
      return 'chrome&chromeId=' + chrome.runtime.id;
    }

    // 2) Handle Yoroi running as a website

    if (environment.userAgentInfo.isFirefox) {
      return 'firefox&host' + location.host;
    }
    // otherwise assume Chrome
    return 'chrome&chromeId=' + location.host;
  }

  prepareStakingURL(): null | string {
    let finalURL = this.props.urlTemplate
      .replace(
        '$$BROWSER$$',
        this.getBrowserReplacement()
      );

    // Add userAda
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver) {
      return null;
    }
    const txRequests = this.generated.stores.transactions
      .getTxRequests(publicDeriver);
    const balance = txRequests.requests.getBalanceRequest.result;
    if (balance != null) {
      const apiMeta = getApiMeta(
        getApiForCoinType(publicDeriver.getParent().getCoinType())
      )?.meta;
      if (apiMeta == null) throw new Error(`${nameof(StakingPage)} no API selected`);
      const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);

      // Seiza does not understand decimal places, so removing all Lovelaces
      finalURL += `&userAda=${formattedAmountWithoutLovelace(balance.dividedBy(
        amountPerUnit
      ))}`;
    }

    finalURL += `&locale=${this.generated.stores.profile.currentLocale}`;
    const delegationStore = this.generated.stores.substores.ada.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingPage)} opened for non-reward wallet`);
    }
    const delegation = delegationRequests.stakingKeyState;
    if (!delegation) {
      return null;
    }
    const poolList = Array.from(
      new Set(delegation.state.delegation.pools.map(pool => pool[0]))
    );
    finalURL += `&delegated=${encodeURIComponent(JSON.stringify(poolList))}`;
    return finalURL;
  }

  render(): Node {
    const { stores } = this.generated;
    const { intl } = this.context;

    const delegationTxStore = stores.substores.ada.delegationTransaction;

    if (
      !delegationTxStore.signAndBroadcastDelegationTx.isExecuting &&
      !delegationTxStore.signAndBroadcastDelegationTx.wasExecuted &&
      this.generated.stores.transactions.hasAnyPending
    ) {
      return (
        <InformativeError
          title={intl.formatMessage(messages.title)}
          text={intl.formatMessage(messages.pendingTxWarning)}
        />
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
    return (
      <SeizaFetcher
        {...this.generated.SeizaFetcherProps}
        stakingUrl={url}
      />
    );
  }

  @computed get generated(): {|
    SeizaFetcherProps: InjectedOrGenerated<SeizaFetcherData>,
    actions: {|
      ada: {|
        delegationTransaction: {|
          reset: {| trigger: (params: void) => void |}
        |}
      |}
    |},
    stores: {|
      profile: {| currentLocale: string |},
      substores: {|
        ada: {|
          delegation: {|
            getDelegationRequests: (
              PublicDeriver<>
            ) => void | DelegationRequests
          |},
          delegationTransaction: {|
            signAndBroadcastDelegationTx: {|
              isExecuting: boolean,
              wasExecuted: boolean
            |}
          |}
        |}
      |},
      transactions: {|
        getTxRequests: (PublicDeriver<>) => TxRequests,
        hasAnyPending: boolean
      |},
      wallets: {| selected: null | PublicDeriver<> |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(StakingPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const adaStores = stores.substores.ada;
    return Object.freeze({
      stores: {
        profile: {
          currentLocale: stores.profile.currentLocale,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        transactions: {
          getTxRequests: stores.transactions.getTxRequests,
          hasAnyPending: stores.transactions.hasAnyPending,
        },
        substores: {
          ada: {
            delegation: {
              getDelegationRequests: adaStores.delegation.getDelegationRequests,
            },
            delegationTransaction: {
              signAndBroadcastDelegationTx: {
                isExecuting:
                  adaStores.delegationTransaction.signAndBroadcastDelegationTx.isExecuting,
                wasExecuted:
                  adaStores.delegationTransaction.signAndBroadcastDelegationTx.wasExecuted,
              },
            },
          },
        },
      },
      actions: {
        ada: {
          delegationTransaction: {
            reset: {
              trigger: actions.ada.delegationTransaction.reset.trigger,
            },
          },
        },
      },
      SeizaFetcherProps: (
        { actions, stores, }: InjectedOrGenerated<SeizaFetcherData>
      ),
    });
  }
}
