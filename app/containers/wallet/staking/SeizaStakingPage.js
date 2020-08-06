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
import type { DelegationRequests } from '../../../stores/toplevel/DelegationStore';
import type { TxRequests } from '../../../stores/toplevel/TransactionsStore';
import { getApiForNetwork, getApiMeta } from '../../../api/common/utils';
import globalMessages from '../../../i18n/global-messages';

export type GeneratedData = typeof SeizaStakingPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  urlTemplate: string,
|};

const messages = defineMessages({
  title: {
    id: 'wallet.staking.warning.title',
    defaultMessage: '!!!Delegation temporarily disabled',
  },
});

/*::
declare var chrome;
*/

@observer
export default class SeizaStakingPage extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    this.generated.actions.jormungandr.delegationTransaction.reset.trigger();
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
          getApiForNetwork(publicDeriver.getParent().getNetworkInfo())
      )?.meta;
      if (apiMeta == null) throw new Error(`${nameof(SeizaStakingPage)} no API selected`);
      const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);

      // Seiza does not understand decimal places, so removing all Lovelaces
      finalURL += `&userAda=${formattedAmountWithoutLovelace(balance.dividedBy(
          amountPerUnit
      ))}`;
    }

    finalURL += `&locale=${this.generated.stores.profile.currentLocale}`;
    const delegationStore = this.generated.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(SeizaStakingPage)} opened for non-reward wallet`);
    }
    const delegation = delegationRequests.getCurrentDelegation.result;
    if (!delegation || delegation.currEpoch == null) {
      return null;
    }
    const poolList = Array.from(
        new Set(delegation.currEpoch.pools.map(pool => pool[0]))
    );
    finalURL += `&delegated=${encodeURIComponent(JSON.stringify(poolList))}`;
    return finalURL;
  }

  render(): Node {
    const { stores } = this.generated;
    const { intl } = this.context;

    const delegationTxStore = stores.substores.jormungandr.delegationTransaction;

    if (
        !delegationTxStore.signAndBroadcastDelegationTx.isExecuting &&
        !delegationTxStore.signAndBroadcastDelegationTx.wasExecuted &&
        this.generated.stores.transactions.hasAnyPending
    ) {
      return (
          <InformativeError
              title={intl.formatMessage(messages.title)}
              text={intl.formatMessage(globalMessages.pendingTxWarning)}
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
      jormungandr: {|
        delegationTransaction: {|
          reset: {| trigger: (params: void) => void |}
        |}
      |}
    |},
    stores: {|
      profile: {| currentLocale: string |},
      delegation: {|
        getDelegationRequests: (
            PublicDeriver<>
        ) => void | DelegationRequests
      |},
      substores: {|
        jormungandr: {|
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
      throw new Error(`${nameof(SeizaStakingPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const jormungandrStores = stores.substores.jormungandr;
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
        delegation: {
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
        substores: {
          jormungandr: {
            delegationTransaction: {
              signAndBroadcastDelegationTx: {
                isExecuting:
                jormungandrStores.delegationTransaction.signAndBroadcastDelegationTx.isExecuting,
                wasExecuted:
                jormungandrStores.delegationTransaction.signAndBroadcastDelegationTx.wasExecuted,
              },
            },
          },
        },
      },
      actions: {
        jormungandr: {
          delegationTransaction: {
            reset: {
              trigger: actions.jormungandr.delegationTransaction.reset.trigger,
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