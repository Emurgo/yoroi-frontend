// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import styles from './WalletListDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import IconEyeOpen from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import { splitAmount, truncateToken } from '../../utils/formatters';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { hiddenAmount } from '../../utils/strings';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { MultiToken } from '../../api/common/lib/MultiToken';
import WalletCard from './WalletCard';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import globalMessages from '../../i18n/global-messages';

const messages = defineMessages({
  addWallet: {
    id: 'wallet.nav.addWallet',
    defaultMessage: '!!!Add Wallet',
  },
  totalBalance: {
    id: 'wallet.topbar.dialog.totalBalance',
    defaultMessage: '!!!Total Balance',
  },
});

type Props = {|
  +close: void => void,
  +shouldHideBalance: boolean,
  +onUpdateHideBalance: void => Promise<void>,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +walletAmount: ?MultiToken,
  +onAddWallet: void => void,
  +wallets: Array<Object>,
  +currentSortedWallets: Array<number> | void,
  +updateSortedWalletList: ({| sortedWallets: Array<number> |}) => Promise<void>,
|};
type State = {|
  walletListIdx: Array<any>,
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
    walletListIdx: [],
    ergoWalletsIdx: [],
    cardanoWalletsIdx: [],
  };

  async componentDidMount(): Promise<void> {
    const cardanoWalletsId = getGeneratedWalletIds(
      this.props.currentSortedWallets.cardano,
      this.props.cardanoWallets.map(wallet => wallet.walletId)
    )
    const ergoWalletsId = getGeneratedWalletIds(
      this.props.currentSortedWallets.ergo,
      this.props.ergoWallets.map(wallet => wallet.walletId)
    )

    this.setState(
      {
        ergoWalletsIdx: ergoWalletsId,
        cardanoWalletsIdx: cardanoWalletsId,
      },
      async () => {
        // await this.props.updateSortedWalletList({ sortedWallets: generatedWalletIds });
      }
    );
  }

  renderAmountDisplay: ({|
    shouldHideBalance: boolean,
    amount: ?MultiToken,
  |}) => Node = request => {
    if (request.amount == null) {
      return <div className={styles.isLoading} />;
    }

    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    let balanceDisplay;
    if (request.shouldHideBalance) {
      balanceDisplay = <span>{hiddenAmount}</span>;
    } else {
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
        shiftedAmount,
        tokenInfo.Metadata.numberOfDecimals
      );

      balanceDisplay = (
        <>
          {beforeDecimalRewards}
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
      );
    }

    return (
      <>
        {balanceDisplay} {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };

  onDragEnd: Object => any = async (network, result) => {
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
        // await this.props.updateSortedWalletList({ sortedWallets: this.state.walletListIdx });
      }
    );
  };

  render(): Node {
    const { intl } = this.context;
    const { ergoWalletsIdx, cardanoWalletsIdx } = this.state;

    const {
      shouldHideBalance,
      onAddWallet,
      walletAmount,
      onUpdateHideBalance,
      wallets,
    } = this.props;

    return (
      <Dialog
        className={styles.component}
        title={`${intl.formatMessage(globalMessages.allWalletsLabel)} (${wallets.length})`}
        closeOnOverlayClick
        closeButton={<DialogCloseButton />}
        onClose={this.props.close}
      >
        {walletAmount &&
        <div className={styles.header}>
          <div className={styles.totalInfo}>
            <div className={styles.amount}>
              <p className={styles.label}>{intl.formatMessage(messages.totalBalance)}</p>
              <p className={styles.value}>
                {this.renderAmountDisplay({
                  shouldHideBalance,
                  amount: walletAmount,
                })}{' '}
                USD
              </p>
            </div>
            <button type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
              {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
            </button>
          </div>
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
                    return <WalletCard key={walletId} idx={idx} {...wallet} />;
                  }).filter(Boolean)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <h1>Ergo, ERG</h1>
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
                    return <WalletCard key={walletId} idx={idx} {...wallet} />;
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
