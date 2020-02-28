// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';

import MyWallets from '../../components/wallet/my-wallets/MyWallets';
import MainLayout from '../MainLayout';

import WalletsList from '../../components/wallet/my-wallets/WalletsList';
import WalletRow from '../../components/wallet/my-wallets/WalletRow';
import WalletDetails from '../../components/wallet/my-wallets/WalletDetails';
import WalletCurrency from '../../components/wallet/my-wallets/WalletCurrency';
import WalletSubRow from '../../components/wallet/my-wallets/WalletSubRow';
import NavPlate from '../../components/topbar/NavPlate';
import SidebarContainer from '../SidebarContainer';
import { ROUTES } from '../../routes-config';
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import WalletSync from '../../components/wallet/my-wallets/WalletSync';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import NavBarAddButton from '../../components/topbar/NavBarAddButton';
import NavWalletDetails from '../../components/topbar/NavWalletDetails';
import type { WalletWithCachedMeta } from '../../stores/toplevel/WalletStore';
import { LOVELACES_PER_ADA } from '../../config/numbersConfig';
import globalMessages from '../../i18n/global-messages';
import { isLedgerNanoWallet, isTrezorTWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';

const messages = defineMessages({
  walletSumInfo: {
    id: 'myWallets.wallets.sumInfoText',
    defaultMessage: '!!!Total wallet balance',
  }
});

type Props = InjectedProps

@observer
export default class MyWalletsPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  updateHideBalance: void => void = () => {
    this.props.actions.profile.updateHideBalance.trigger();
  }

  componentDidMount() {
    this.props.actions.wallets.unselectWallet.trigger();
  }

  handleWalletNavItemClick: (string, WalletWithCachedMeta) => void = (
    page,
    publicDeriver
  ) => {
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.PAGE,
      params: { id: publicDeriver.self.getPublicDeriverId(), page },
    });
  };

  render() {
    const { intl } = this.context;
    const { actions, stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const sidebarContainer = (<SidebarContainer actions={actions} stores={stores} />);

    const wallets = this.props.stores.wallets.publicDerivers;

    let utxoTotal = new BigNumber(0);
    for (const walletUtxoAmount of wallets.map(wallet => wallet.amount)) {
      if (walletUtxoAmount == null) {
        utxoTotal = null;
        break;
      }
      utxoTotal = utxoTotal.plus(walletUtxoAmount);
    }


    const navbarTitle = (
      <NavBarTitle title={this.context.intl.formatMessage(globalMessages.sidebarWallets)} />
    );

    const navbarElement = (
      <NavBar
        title={navbarTitle}
        walletPlate={<NavBarAddButton onClick={
          () => this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD })
        }
        />}
        walletDetails={
          <NavWalletDetails
            showDetails={false}
            highlightTitle
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={profile.shouldHideBalance}
            rewards={new BigNumber('0.000000') /* TODO */}
            walletAmount={utxoTotal}
            infoText={intl.formatMessage(messages.walletSumInfo)}
          />
        }
      />
    );

    const walletsList = (
      <WalletsList>
        {wallets.map(wallet => this.generateRow(wallet))}
      </WalletsList>
    );

    return (
      <MainLayout
        sidebar={sidebarContainer}
        navbar={navbarElement}
        connectionErrorType={checkAdaServerStatus}
        showInContainer
      >
        <MyWallets>
          {walletsList}
        </MyWallets>
      </MainLayout>
    );
  }

  /*
  * TODO: this should operator on conceptual wallets
  * with publicDerivers acting as sub-rows
  * but since we don't support multi-currency or multi-account yet we simplify the UI for now
  */
  generateRow: WalletWithCachedMeta => Node = (publicDeriver) => {
    const walletName = publicDeriver ? publicDeriver.conceptualWalletName : '';

    const walletSumCurrencies = (
      <>
        <WalletCurrency
          currency="ADA"
          tooltipText={undefined /* TODO */}
        />
      </>
    );
    return (
      <WalletRow
        isExpandable={false /* TODO: should be expandable if > 1 public deriver */}
        key={publicDeriver.self.getPublicDeriverId()}
        onRowClicked={page => this.handleWalletNavItemClick(page, publicDeriver)}
        walletSumDetails={<WalletDetails
          walletAmount={publicDeriver.amount}
          rewards={this.getRewardBalance(publicDeriver)}
          // TODO: This should be probably bound to an individual wallet
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={this.props.stores.profile.shouldHideBalance}
        />}
        walletSumCurrencies={walletSumCurrencies}
        walletSubRow={() => this.createSubrow(publicDeriver)}
        walletPlate={
          <NavPlate
            publicDeriver={publicDeriver}
            walletName={walletName}
            walletType={getWalletType(publicDeriver)}
          />
        }
        walletSync={
          <WalletSync
            time={
              publicDeriver.lastSyncInfo.Time
                ? moment(publicDeriver.lastSyncInfo.Time).fromNow()
                : null
            }
          />
        }
      />
    );
  }

  createSubrow: WalletWithCachedMeta => Node = (publicDeriver) => {
    const { intl } = this.context;

    // TODO: replace with wallet addresses
    const walletAddresses = [
      'Ae45dPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nbdf4u3',
      'Ae2tdPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nmt4s7'
    ];

    const addressesLength = walletAddresses.length;

    const walletSubRow = (
      <WalletSubRow
        publicDeriver={publicDeriver}
        // TODO: do we delete WalletDetails? Lots of duplication with Nav alternative
        walletDetails={<WalletDetails
          infoText={
            `${addressesLength} ${
              intl.formatMessage(addressesLength > 1 ?
                globalMessages.addressesLabel : globalMessages.addressLabel)}`
          }
          // TODO: This should be probably bound to an individual wallet
          onUpdateHideBalance={this.updateHideBalance}
          shouldHideBalance={this.props.stores.profile.shouldHideBalance}
          rewards={null /* TODO */}
          walletAmount={null /* TODO */}
        />}
        walletNumber={1}
        walletAddresses={walletAddresses /* TODO: replace with proper hashes */}
        walletCurrencies={<WalletCurrency
          currency="ADA"
          tooltipText="0.060" // TODO
        />}
      />
    );

    return walletSubRow;
  }

  /**
   * undefined => wallet is not a reward wallet
   * null => still calculating
   * value => done calculating
   */
  getRewardBalance: WalletWithCachedMeta => null | void | BigNumber = (
    publicDeriver
  ) => {
    const delegationRequest = this.props.stores.substores.ada.delegation.getRequests(
      publicDeriver.self
    );
    if (delegationRequest == null) return undefined;

    const balanceResult = delegationRequest.getDelegatedBalance.result;
    if (balanceResult == null) {
      return null;
    }
    return balanceResult.accountPart.dividedBy(LOVELACES_PER_ADA);
  }
}

function getWalletType(publicDeriver: WalletWithCachedMeta) {
  const conceptualWallet = publicDeriver.self.getParent();
  if (isLedgerNanoWallet(conceptualWallet)) {
    return 'ledger';
  }
  if (isTrezorTWallet(conceptualWallet)) {
    return 'trezor';
  }
  return 'standard';
}
