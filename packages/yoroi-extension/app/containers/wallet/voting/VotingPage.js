// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import Voting from '../../../components/wallet/voting/Voting';
import VotingRegistrationDialogContainer from '../dialogs/voting/VotingRegistrationDialogContainer';
import type { GeneratedData as VotingRegistrationDialogContainerData } from '../dialogs/voting/VotingRegistrationDialogContainer';
import { handleExternalLinkClick } from '../../../utils/routing';
import { WalletTypeOption, } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import UnsupportedWallet from '../UnsupportedWallet';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import VerticallyCenteredLayout from '../../../components/layout/VerticallyCenteredLayout';
import { CATALYST_MIN_AMOUNT } from '../../../config/numbersConfig';
import InsufficientFundsPage from './InsufficientFundsPage';
import { getTokenName, genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import environment from '../../../environment';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import RegistrationOver from './RegistrationOver';
import { networks, } from '../../../api/ada/lib/storage/database/prepackaged/networks';

export type GeneratedData = typeof VotingPage.prototype.generated;
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};

const roundInfo = {
  startDate: new Date(Date.parse('6 May 2021 19:00:00 GMT')),
  endDate: new Date(Date.parse('13 May 2021 19:00:00 GMT')),
  nextRound: 4,
};

@observer
export default class VotingPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  onClose: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  start: void => void = () => {
    this.generated.actions.dialogs.open.trigger({ dialog: VotingRegistrationDialogContainer });
  };

  render(): Node {
    const {
      uiDialogs,
      wallets: { selected },
    } = this.generated.stores;
    let activeDialog = null;

    if(selected == null){
      throw new Error(`${nameof(VotingPage)} no wallet selected`);
    }
    if (selected.getParent().getWalletType() === WalletTypeOption.HARDWARE_WALLET) {
      return <UnsupportedWallet />;
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
    if (!environment.isTest()) {
      const isLate = new Date() >= roundInfo.endDate;
      const isEarly = new Date() <= roundInfo.startDate;
      if (
        selected.getParent().getNetworkInfo().NetworkId === networks.CardanoMainnet.NetworkId &&
        (isEarly || isLate)
      ) {
        return (
          <RegistrationOver roundNumber={
              isLate
                ? roundInfo.nextRound
                : roundInfo.nextRound - 1
            }
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
      return <InsufficientFundsPage
        currentBalance={
          balance.getDefaultEntry().amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
        }
        requiredBalance={CATALYST_MIN_AMOUNT.shiftedBy(-tokenInfo.Metadata.numberOfDecimals)}
        tokenName={getTokenName(tokenInfo)}
      />;
    }

    if (uiDialogs.isOpen(VotingRegistrationDialogContainer)) {
      activeDialog = (
        <VotingRegistrationDialogContainer
          {...this.generated.VotingRegistrationDialogProps}
          onClose={this.onClose}
        />
      );
    }
    return (
      <div>
        {activeDialog}
        <Voting
          start={this.start}
          hasAnyPending={this.generated.hasAnyPending}
          onExternalLinkClick={handleExternalLinkClick}
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
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(VotingPage)} no way to generated props`);
    }

    const { stores, actions } = this.props;
    const txInfo = (() => {
      const selected = stores.wallets.selected;
      if (selected == null) return {
        hasAnyPending: false,
        balance: null,
      };
      const txRequests = stores.transactions.getTxRequests(selected);
      return {
        hasAnyPending: (txRequests.requests.pendingRequest.result ?? []).length > 0,
        // note: Catalyst balance depends on UTXO balance -- not on rewards
        balance: txRequests.requests.getBalanceRequest.result,
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
      },
      VotingRegistrationDialogProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<VotingRegistrationDialogContainerData>),
    });
  }
}
