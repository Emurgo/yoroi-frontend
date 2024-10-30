// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import Voting from '../../../components/wallet/voting/Voting';
import VotingRegistrationDialogContainer from '../dialogs/voting/VotingRegistrationDialogContainer';
import { handleExternalLinkClick } from '../../../utils/routing';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import VerticallyCenteredLayout from '../../../components/layout/VerticallyCenteredLayout';
import { CATALYST_MIN_AMOUNT } from '../../../config/numbersConfig';
import InsufficientFundsPage from './InsufficientFundsPage';
import { genLookupOrFail, getTokenName } from '../../../stores/stateless/tokenHelpers';
import environment from '../../../environment';
import RegistrationOver from './RegistrationOver';

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
class VotingPageContent extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  onClose: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  start: void => void = () => {
    this.props.actions.dialogs.open.trigger({ dialog: VotingRegistrationDialogContainer });
  };

  render(): Node {
    const { intl } = this.context;
    const { actions, stores } = this.props;
    const {
      uiDialogs,
      wallets: { selected },
    } = this.props.stores;
    let activeDialog = null;

    if (selected == null) {
      throw new Error(`${nameof(VotingPageContent)} no wallet selected`);
    }

    const balance = this.props.stores.transactions.balance;
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
    } = this.props.stores.substores.ada.votingStore;

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
    }

    // disable the minimum on E2E tests
    if (!environment.isTest() && balance.getDefaultEntry().amount.lt(CATALYST_MIN_AMOUNT)) {
      const getTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo);
      const tokenInfo = getTokenInfo({
        identifier: selected.defaultTokenId,
        networkId: selected.networkId,
      });
      return (
        <InsufficientFundsPage
          currentBalance={balance
            .getDefaultEntry()
            .amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals)}
          requiredBalance={CATALYST_MIN_AMOUNT.shiftedBy(
            -tokenInfo.Metadata.numberOfDecimals
          )}
          tokenName={getTokenName(tokenInfo)}
        />
      );
    }

    // todo: unify type tags
    const walletType = ({
      'mnemonic': 'mnemonic',
      'ledger': 'ledgerNano',
      'trezor': 'trezorT',
    })[selected.type];

    // <TODO:display fund info to user>
    // const { currentFund, nextFund } = catalystRoundInfo;
    // const isCurrentFund = currentFund != null;
    // const isNextFund = nextFund != null;
    // const now = Date.now();
    // const isBeforeVoting = isCurrentFund && Date.parse(currentFund.votingStart) >= now;
    // const isAfterVoting = isCurrentFund && Date.parse(currentFund.votingEnd) <= now;
    // const isBetweenVoting = !isBeforeVoting && !isAfterVoting;

    if (uiDialogs.isOpen(VotingRegistrationDialogContainer)) {
      activeDialog = (
        <VotingRegistrationDialogContainer
          actions={actions}
          stores={stores}
          onClose={this.onClose}
          walletType={walletType}
        />
      );
    }

    const publicDeriver = this.props.stores.wallets.selected;
    if (!publicDeriver) {
      throw new Error(`${nameof(this.render)} no public deriver. Should never happen`);
    }
    const delegationStore = this.props.stores.delegation;
    const isDelegating = delegationStore.isCurrentlyDelegating(publicDeriver.publicDeriverId);

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
          hasAnyPending={this.props.stores.transactions.hasAnyPending}
          onExternalLinkClick={handleExternalLinkClick}
          isDelegated={isDelegating}
          name={fundName}
          walletType={walletType}
        />
      </div>
    );
  }
}

export default VotingPageContent;
