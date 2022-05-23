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
import { splitAmount, truncateToken } from '../../utils/formatters';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { hiddenAmount } from '../../utils/strings';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { MultiToken } from '../../api/common/lib/MultiToken';
import WalletCard from './WalletCard';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import globalMessages from '../../i18n/global-messages';
import { formatValue } from '../../utils/unit-of-account';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import AmountDisplay from '../common/AmountDisplay';
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
  +getCurrentPrice: (from: string, to: string) => ?number,
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
    let totalAmount = new BigNumber('0');

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
      walletAmount,
    } = this.props;

    const quickAccessList = new Set(this.props.walletsNavigation.quickAccess)

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
            <div className={styles.amount}>
              <p className={styles.label}>{intl.formatMessage(messages.totalBalance)}</p>
              <p className={styles.value}>
                <AmountDisplay
                  shouldHideBalance={shouldHideBalance}
                  amount={walletAmount}
                  getTokenInfo={this.props.getTokenInfo}
                  showFiat
                  showAmount={false}
                />
              </p>
            </div>
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
                      />);
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
}
