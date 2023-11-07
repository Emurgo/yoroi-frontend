// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { FormattedHTMLMessage, defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import Voting from '../../../components/wallet/voting/Voting';
import VotingRegistrationDialogContainer from '../dialogs/voting/VotingRegistrationDialogContainer';
import type { GeneratedData as VotingRegistrationDialogContainerData } from '../dialogs/voting/VotingRegistrationDialogContainer';
import { handleExternalLinkClick } from '../../../utils/routing';
import { WalletTypeOption } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import VerticallyCenteredLayout from '../../../components/layout/VerticallyCenteredLayout';
import { CATALYST_MIN_AMOUNT, CATALYST_DISPLAYED_MIN_AMOUNT } from '../../../config/numbersConfig';
import InsufficientFundsPage from './InsufficientFundsPage';
import { getTokenName, genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import environment from '../../../environment';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import RegistrationOver from './RegistrationOver';
import type { DelegationRequests } from '../../../stores/toplevel/DelegationStore';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../../api/ada/lib/storage/models/ConceptualWallet/index';
import type { CatalystRoundInfoResponse } from '../../../api/ada/lib/state-fetch/types';

export type GeneratedData = typeof VotingPageContent.prototype.generated;
type Props = InjectedOrGenerated<GeneratedData>;

const messages: * = defineMessages({
  mainTitle: {
    id: 'wallet.registrationOver.mainTitle',
    defaultMessage: '!!!Registration is not available',
  },
  mainSubtitle: {
    id: 'wallet.registrationOver.mainSubtitle',
    defaultMessage:
      '!!!The registration period for fund {roundNumber} has ended. For more information, check the <a href="https://projectcatalyst.io/get-involved/become-a-voter" target="_blank"> Catalyst app. </a>',
  },
  unavailableTitle: {
    id: 'wallet.registrationOver.unavailableTitle',
    defaultMessage: '!!!Catalyst Round information is currently unavailable.',
  },
  unavailableSubtitle: {
    id: 'wallet.registrationOver.unavailableSubtitle',
    defaultMessage: '!!!Please check the Catalyst app for more info',
  },
  earlyForRegistrationTitle: {
    id: 'wallet.registrationOver.earlyForRegistrationTitle',
    defaultMessage: "!!!Registration hasn't started yet.",
  },
  earlyForRegistrationSubTitle: {
    id: 'wallet.registrationOver.earlyForRegistrationSubTitle',
    defaultMessage: '!!!Registration for Round {roundNumber} begins at {registrationStart}.',
  },
  beforeVotingSubtitle: {
    id: 'wallet.registrationOver.beforeVotingSubtitle',
    defaultMessage: '!!!Registration has ended. Voting starts at {votingStart}',
  },
  betweenVotingSubtitle: {
    id: 'wallet.registrationOver.betweenVotingSubtitle',
    defaultMessage: '!!!"Registration has ended.  Voting ends at  {votingEnd}',
  },
  nextFundRegistration: {
    id: 'wallet.registrationOver.nextFundRegistration',
    defaultMessage: 'Round {roundNumber} starts at {registrationStart}',
  },
});

@observer
class VotingPageContent extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  onClose: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  start: void => void = () => {
    this.generated.actions.dialogs.open.trigger({ dialog: VotingRegistrationDialogContainer });
  };

  get isDelegated(): ?boolean {
    const publicDeriver = this.generated.stores.wallets.selected;
    const delegationStore = this.generated.stores.delegation;

    if (!publicDeriver) {
      throw new Error(`${nameof(this.isDelegated)} no public deriver. Should never happen`);
    }

    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(this.isDelegated)} called for non-reward wallet`);
    }
    const currentDelegation = delegationRequests.getDelegatedBalance;

    if (
      !currentDelegation.wasExecuted ||
      currentDelegation.isExecuting ||
      currentDelegation.result == null
    ) {
      return undefined;
    }
    if (currentDelegation.result.delegation == null) {
      return false;
    }
    return true;
  }

  render(): Node {
    const { intl } = this.context;
    const {
      uiDialogs,
      wallets: { selected },
    } = this.generated.stores;
    let activeDialog = null;

    if (selected == null) {
      throw new Error(`${nameof(VotingPageContent)} no wallet selected`);
    }

    const balance = this.generated.balance;
    if (balance == null) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }

    // keep enabled on the testnet
    const {
      catalystRoundInfo,
      loadingCatalystRoundInfo,
    } = this.generated.stores.substores.ada.votingStore;

    if (loadingCatalystRoundInfo) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }

    if (!environment.isTest()) {
      if (!catalystRoundInfo || (!catalystRoundInfo.currentFund && !catalystRoundInfo.nextFund)) {
        return (
          <RegistrationOver
            title={intl.formatMessage(messages.unavailableTitle)}
            subtitle={intl.formatMessage(messages.unavailableSubtitle)}
          />
        );
      }

      const { currentFund, nextFund } = catalystRoundInfo;
      const nextFundRegistrationSubtitle = intl.formatMessage(messages.nextFundRegistration, {
        roundNumber: nextFund?.id,
        registrationStart: nextFund?.registrationStart,
      });

      if (currentFund) {
        const isLate = new Date() >= new Date(Date.parse(currentFund.registrationEnd));
        const isEarly = new Date() <= new Date(Date.parse(currentFund.registrationStart));
        const isBeforeVoting = new Date() <= new Date(Date.parse(currentFund.votingStart));
        const isAfterVoting = new Date() >= new Date(Date.parse(currentFund.votingEnd));
        const isBetweenVoting = !isBeforeVoting && !isAfterVoting;

        if (isEarly) {
          return (
            <RegistrationOver
              title={intl.formatMessage(messages.earlyForRegistrationTitle)}
              subtitle={intl.formatMessage(messages.earlyForRegistrationSubTitle, {
                roundNumber: currentFund.id,
                registrationStart: currentFund.registrationStart,
              })}
            />
          );
        }

        // registeration is ended -> check for voting start and end dates
        if (isLate) {
          if (isBeforeVoting) {
            return (
              <RegistrationOver
                title={intl.formatMessage(messages.mainTitle)}
                subtitle={intl.formatMessage(messages.beforeVotingSubtitle, {
                  votingStart: currentFund.votingStart,
                })}
              />
            );
          }

          if (isBetweenVoting) {
            return (
              <RegistrationOver
                title={intl.formatMessage(messages.mainTitle)}
                subtitle={intl.formatMessage(messages.betweenVotingSubtitle, {
                  votingEnd: currentFund.votingEnd,
                })}
              />
            );
          }

          if (isAfterVoting) {
            /* if we after the voting date (= between funds) and no next funds
            will dispaly "round is over" */
            const subtitle = nextFund ? (
              nextFundRegistrationSubtitle
            ) : (
              <FormattedHTMLMessage
                {...messages.mainSubtitle}
                values={{
                  roundNumber: currentFund.id,
                }}
              />
            );

            return (
              <RegistrationOver
                title={intl.formatMessage(messages.mainTitle)}
                subtitle={subtitle}
              />
            );
          }
        }
      } else if (nextFund) {
        // No current funds -> check for next funds
        return (
          <RegistrationOver
            title={intl.formatMessage(messages.mainTitle)}
            subtitle={nextFundRegistrationSubtitle}
          />
        );
      }
    }

    // disable the minimum on E2E tests
    if (!environment.isTest() && balance.getDefaultEntry().amount.lt(CATALYST_MIN_AMOUNT)) {
      const getTokenInfo = genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo);
      const tokenInfo = getTokenInfo({
        identifier: selected.getParent().getDefaultToken().defaultIdentifier,
        networkId: selected.getParent().getDefaultToken().defaultNetworkId,
      });
      return (
        <InsufficientFundsPage
          currentBalance={balance
            .getDefaultEntry()
            .amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals)}
          requiredBalance={CATALYST_DISPLAYED_MIN_AMOUNT.shiftedBy(
            -tokenInfo.Metadata.numberOfDecimals
          )}
          tokenName={getTokenName(tokenInfo)}
        />
      );
    }

    let walletType;
    if (selected.getParent().getWalletType() !== WalletTypeOption.HARDWARE_WALLET) {
      walletType = 'mnemonic';
    } else if (isTrezorTWallet(selected.getParent())) {
      walletType = 'trezorT';
    } else if (isLedgerNanoWallet(selected.getParent())) {
      walletType = 'ledgerNano';
    } else {
      throw new Error(`${nameof(VotingPageContent)} unexpected wallet type`);
    }

    if (uiDialogs.isOpen(VotingRegistrationDialogContainer)) {
      activeDialog = (
        <VotingRegistrationDialogContainer
          {...this.generated.VotingRegistrationDialogProps}
          onClose={this.onClose}
          walletType={walletType}
        />
      );
    }

    /*
    At this point we are sure that we have current funds
    I added the "5" for two reasons
    1. As a placeholder as the component will not be rendered without it.
    2. this page you can see it in test environment even if you
    out of the registration dates.
    */
    const round = catalystRoundInfo?.currentFund?.id || catalystRoundInfo?.nextFund?.id || 5;
    const fundName = catalystRoundInfo?.currentFund?.name || round.toString();
    return (
      <div>
        {activeDialog}
        <Voting
          start={this.start}
          hasAnyPending={this.generated.hasAnyPending}
          onExternalLinkClick={handleExternalLinkClick}
          isDelegated={this.isDelegated === true}
          name={fundName}
          walletType={walletType}
        />
      </div>
    );
  }

  @computed get generated(): {|
    VotingRegistrationDialogProps: InjectedOrGenerated<VotingRegistrationDialogContainerData>,
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
      |},
    |},
    hasAnyPending: boolean,
    balance: ?MultiToken,
    stores: {|
      uiDialogs: {|
        isOpen: any => boolean,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
      |},
      delegation: {|
        getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests,
      |},
      substores: {|
        ada: {|
          votingStore: {|
            catalystRoundInfo: ?CatalystRoundInfoResponse,
            loadingCatalystRoundInfo: boolean,
          |},
        |},
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(VotingPageContent)} no way to generated props`);
    }

    const { stores, actions } = this.props;
    const txInfo = (() => {
      const selected = stores.wallets.selected;
      if (selected == null)
        return {
          hasAnyPending: false,
          balance: null,
        };
      return {
        hasAnyPending: stores.transactions.hasAnyPending,
        // note: Catalyst balance depends on UTXO balance -- not on rewards
        balance: stores.transactions.balance,
      };
    })();
    return Object.freeze({
      ...txInfo,
      actions: {
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
      },
      stores: {
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        delegation: {
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
        substores: {
          ada: {
            votingStore: {
              catalystRoundInfo: stores.substores.ada.votingStore.catalystRoundInfo,
              loadingCatalystRoundInfo: stores.substores.ada.votingStore.loadingCatalystRoundInfo,
            },
          },
        },
      },
      VotingRegistrationDialogProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<VotingRegistrationDialogContainerData>),
    });
  }
}

export default VotingPageContent;
