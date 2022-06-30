// @flow
import { BigNumber } from 'bignumber.js';
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import styles from './WalletListDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as IconEyeOpen }  from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import { ReactComponent as IconEyeClosed }  from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { MultiToken } from '../../api/common/lib/MultiToken';
import WalletCard from './WalletCard';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import globalMessages from '../../i18n/global-messages';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import AmountDisplay, { FiatDisplay } from '../common/AmountDisplay';
import type { WalletsNavigation } from '../../api/localStorage';

const messages = defineMessages({
  addWallet: {
    id: 'wallet.nav.addWallet',
    defaultMessage: '!!!Add Wallet',
  },
  totalBalance: {
    id: 'wallet.topbar.dialog.totalBalance',
    defaultMessage: '!!!Total Balance',
  },
  ergo: {
    id: 'wallet.topbar.dialog.ergo',
    defaultMessage: '!!!Ergo, ERG',
  },
  cardano: {
    id: 'wallet.topbar.dialog.cardano',
    defaultMessage: '!!!Cardano, ADA',
  },
});

type Props = {|
  +close: void => void,
  +shouldHideBalance: boolean,
  +onUpdateHideBalance: void => Promise<void>,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +walletAmount: ?MultiToken,
  +onAddWallet: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +updateSortedWalletList: ({| sortedWallets: Array<number> |}) => Promise<void>,
  +ergoWallets: Array<Object>,
  +cardanoWallets: Array<Object>,
  +walletsNavigation: WalletsNavigation,
  +updateSortedWalletList: WalletsNavigation => Promise<void>,
|};
type State = {|
  ergoWalletsIdx: number[],
  cardanoWalletsIdx: number[],
|};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getGeneratedWalletIds = (sortedWalletListIdx, currentWalletIdx) => {
  let generatedWalletIds;
  if (sortedWalletListIdx !== undefined && sortedWalletListIdx.length > 0) {
    const newWalletIds = currentWalletIdx.filter(id => {
      const index = sortedWalletListIdx.indexOf(id);
      if (index === -1) {
        return true;
      }
      return false;
    });
    generatedWalletIds = [...sortedWalletListIdx, ...newWalletIds];
  } else {
    generatedWalletIds = currentWalletIdx;
  }

  return generatedWalletIds
}
@observer
export default class WalletListDialog extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  state: State = {
    ergoWalletsIdx: [],
    cardanoWalletsIdx: [],
  };

  async componentDidMount(): Promise<void> {
    const cardanoWalletsId = getGeneratedWalletIds(
      this.props.walletsNavigation.cardano,
      this.props.cardanoWallets.map(wallet => wallet.walletId)
    )
    const ergoWalletsId = getGeneratedWalletIds(
      this.props.walletsNavigation.ergo,
      this.props.ergoWallets.map(wallet => wallet.walletId)
    )

    this.setState(
      {
        ergoWalletsIdx: ergoWalletsId,
        cardanoWalletsIdx: cardanoWalletsId,
      },
      async () => {
        await this.props.updateSortedWalletList({
          ergo: ergoWalletsId,
          cardano: cardanoWalletsId,
          quickAccess: this.props.walletsNavigation.quickAccess || [],
        });
      }
    );
  }

  toggleQuickAccess: number => Promise<void> = async (walletId) => {
    if(!walletId || typeof walletId !== 'number') throw new Error('Invalid wallet id.')
    const currentQuickAccessList = this.props.walletsNavigation.quickAccess
    let updatedQuickAccessList = [...currentQuickAccessList];
    // Remove wallet
    if(currentQuickAccessList.indexOf(walletId) !== -1) {
      updatedQuickAccessList =  updatedQuickAccessList.filter(id => id !== walletId)
    } else {
      // Add wallet
      updatedQuickAccessList.push(walletId)
    }

    await this.props.updateSortedWalletList({
      ...this.props.walletsNavigation,
      quickAccess: updatedQuickAccessList
    });
  }

  onDragEnd: (network: 'ergo' | 'cardano' ,result:Object) => any = async (network, result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) {
      return;
    }

    this.setState(
      prev => {
        const walletListIdx = reorder(
          network === 'ergo' ? prev.ergoWalletsIdx : prev.cardanoWalletsIdx,
          result.source.index,
          result.destination.index
        );
        return {
          ergoWalletsIdx: network === 'ergo' ? walletListIdx : prev.ergoWalletsIdx,
          cardanoWalletsIdx: network === 'cardano' ? walletListIdx: prev.cardanoWalletsIdx
        };
      },
      async function () {
        await this.props.updateSortedWalletList({
          ergo: this.state.ergoWalletsIdx,
          cardano: this.state.cardanoWalletsIdx,
          quickAccess: this.props.walletsNavigation.quickAccess || [],
        });
      }
    );
  };

  render(): Node {
    const { intl } = this.context;
    const { ergoWalletsIdx, cardanoWalletsIdx } = this.state;

    const {
      shouldHideBalance,
      onAddWallet,
      onUpdateHideBalance,
      ergoWallets,
      cardanoWallets,
      unitOfAccountSetting,
      getCurrentPrice,
    } = this.props;

    const quickAccessList = new Set(this.props.walletsNavigation.quickAccess)

    const walletsTotal = this.renderWalletsTotal();

    return (
      <Dialog
        className={styles.component}
        title={`${intl.formatMessage(globalMessages.allWalletsLabel)} (${ergoWallets.length + cardanoWallets.length})`}
        closeOnOverlayClick
        closeButton={<DialogCloseButton />}
        onClose={this.props.close}
      >
        <div className={styles.header}>
          <div className={styles.totalInfo}>
            {(walletsTotal !== undefined) && (
              <div className={styles.amount}>
                <p className={styles.label}>{intl.formatMessage(messages.totalBalance)}</p>
                <p className={styles.value}>
                  {walletsTotal}
                </p>
              </div>
            )}
            <button type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
              {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
            </button>
          </div>
        </div>
        {cardanoWalletsIdx.length > 0 &&
        <div className={styles.sectionHeader}>
          <h1>{intl.formatMessage(messages.cardano)}</h1>
        </div>}
        <DragDropContext onDragEnd={(result) => this.onDragEnd('cardano', result)}>
          <Droppable droppableId="cardano-list-droppable">
            {provided => (
              <div className={styles.list} {...provided.droppableProps} ref={provided.innerRef}>
                {cardanoWalletsIdx.length > 0 &&
                  cardanoWalletsIdx.map((walletId, idx) => {
                    const wallet = this.props.cardanoWallets.find(w => w.walletId === walletId);
                    if (!wallet) {
                      return null;
                    }
                    return (
                      <WalletCard
                        key={walletId}
                        idx={idx}
                        toggleQuickAccess={this.toggleQuickAccess}
                        isInQuickAccess={quickAccessList.has(walletId)}
                        {...wallet}
                        unitOfAccountSetting={unitOfAccountSetting}
                        getCurrentPrice={getCurrentPrice}
                      />
                    );
                  }).filter(Boolean)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {cardanoWalletsIdx.length > 0 &&
        <div className={styles.sectionHeader}>
          <h1>{intl.formatMessage(messages.ergo)}</h1>
        </div>}
        <DragDropContext onDragEnd={(result) => this.onDragEnd('ergo', result)}>
          <Droppable droppableId="ergo-list-droppable">
            {provided => (
              <div className={styles.list} {...provided.droppableProps} ref={provided.innerRef}>
                {ergoWalletsIdx.length > 0 &&
                  ergoWalletsIdx.map((walletId, idx) => {
                    const wallet = this.props.ergoWallets.find(w => w.walletId === walletId);
                    if (!wallet) {
                      return null;
                    }
                    return (
                      <WalletCard
                        key={walletId}
                        idx={idx}
                        toggleQuickAccess={this.toggleQuickAccess}
                        isInQuickAccess={quickAccessList.has(walletId)}
                        {...wallet}
                        unitOfAccountSetting={unitOfAccountSetting}
                        getCurrentPrice={getCurrentPrice}
                      />
                    );
                  }).filter(Boolean)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <div className={styles.footer}>
          <button type="button" className={styles.toggleButton} onClick={onAddWallet}>
            {intl.formatMessage(messages.addWallet)}
          </button>
        </div>
      </Dialog>
    );
  }

  renderWalletsTotal(): ?Node {
    const {
      unitOfAccountSetting,
      cardanoWallets,
      ergoWallets,
      shouldHideBalance,
      getCurrentPrice,
    } = this.props;
    if (unitOfAccountSetting.enabled) {
      const adaFiat = this.sumWallets(cardanoWallets).fiat;
      const ergFiat = this.sumWallets(ergoWallets).fiat;
      if (adaFiat != null && ergFiat != null) {
        const totalFiat = adaFiat.plus(ergFiat);
        const { currency } = unitOfAccountSetting;
        return (
          <FiatDisplay
            shouldHideBalance={shouldHideBalance}
            amount={totalFiat}
            currency={currency}
          />
        );
      }
    }
    // either unit of account is not enabled, or fails to convert to fiat
    if (ergoWallets.length === 0) {
      // only have Cardano wallets
      const amount = this.sumWallets(cardanoWallets).sum;
      return (
        <AmountDisplay
          shouldHideBalance={shouldHideBalance}
          amount={amount}
          getTokenInfo={this.props.getTokenInfo}
          showFiat={false}
          showAmount
          unitOfAccountSetting={unitOfAccountSetting}
          getCurrentPrice={getCurrentPrice}
        />
      );
    }
    if (cardanoWallets.length === 0) {
      const amount = this.sumWallets(ergoWallets).sum;
      return (
        <AmountDisplay
          shouldHideBalance={shouldHideBalance}
          amount={amount}
          getTokenInfo={this.props.getTokenInfo}
          showFiat={false}
          showAmount
          unitOfAccountSetting={unitOfAccountSetting}
          getCurrentPrice={getCurrentPrice}
        />
      );
    }
    // there are both ADAs and ERGs, don't show total
    return undefined;
  }

  sumWallets(
    wallets: Array<Object>
  ): {|
    sum: MultiToken | null,
    fiat: BigNumber | null,
  |} {
    const {
      unitOfAccountSetting,
      getTokenInfo,
      getCurrentPrice,
    } = this.props;
    if (wallets.length === 0) {
      return { sum: null, fiat: new BigNumber('0') };
    }
    let sum;
    if (wallets[0].walletAmount) {
      sum = new MultiToken(
        wallets[0].walletAmount.values,
        wallets[0].walletAmount.defaults,
      );
    } else {
      return { sum: null, fiat: null };
    }

    if (wallets[0].rewards) {
      sum.joinAddMutable(wallets[0].rewards);
    }

    for (let i = 1; i < wallets.length; i ++ ) {
      if (wallets[i].walletAmount) {
        sum.joinAddMutable(new MultiToken(
          // treat TADA as ADA or vice versa
          wallets[i].walletAmount.values.map(v => ({
            ...v,
            networkId: sum.getDefaults().defaultNetworkId,
          })),
          sum.getDefaults(),
        ));
      } else {
        return { sum: null, fiat: null };
      }

      if (wallets[i].rewards) {
        sum.joinAddMutable(new MultiToken(
          // treat TADA as ADA or vice versa
          wallets[i].rewards.values.map(v => ({
            ...v,
            networkId: sum.getDefaults().defaultNetworkId,
          })),
          sum.getDefaults(),
        ));
      }
    }
    if (!unitOfAccountSetting.enabled) {
      return { sum, fiat: null };
    }
    const defaultEntry = sum.getDefaultEntry();
    const tokenInfo = getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount
          .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
    const ticker = tokenInfo.Metadata.ticker;
    if (ticker == null) {
      throw new Error('unexpected main token type');
    }
    const { currency } = unitOfAccountSetting;
    if (!currency) {
      throw new Error(`unexpected unit of account ${String(currency)}`);
    }
    const price = getCurrentPrice(ticker, currency);
    if (price != null) {
      return { sum, fiat: shiftedAmount.multipliedBy(price) };
    }
    return { sum, fiat: null };
  }
}
