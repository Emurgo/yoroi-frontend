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
import IconEyeOpen from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import { hiddenAmount } from '../../utils/strings';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { MultiToken } from '../../api/common/lib/MultiToken';
import WalletCard from './WalletCard';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import globalMessages from '../../i18n/global-messages';
import { formatValue } from '../../utils/unit-of-account';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';

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
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?number,
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
@observer
export default class WalletListDialog extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  state: State = {
    walletListIdx: [],
  };

  async componentDidMount(): Promise<void> {
    const sortedWalletListIdx = this.props.currentSortedWallets;
    const currentWalletIdx = this.props.wallets.map(wallet => wallet.walletId);

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

    this.setState(
      {
        walletListIdx: generatedWalletIds,
      },
      async () => {
        await this.props.updateSortedWalletList({ sortedWallets: generatedWalletIds });
      }
    );
  }

  renderWalletSum: {|
    shouldHideBalance: boolean,
    walletAmounts: Array<?MultiToken>,
    rewards: Array<?MultiToken>,
  |} => Node = (request) => {
    const { currency } = this.props.unitOfAccountSetting;
    if (!currency) {
      throw new Error(`unexpected unit of account ${String(currency)}`);
    }
    if (request.shouldHideBalance) {
      return (
        <>
          <span>{hiddenAmount}</span>
          {' ' + currency}
        </>
      );
    }
    let totalAmount = new BigNumber('0');

    for (const amount of [...request.walletAmounts, ...request.rewards]) {
      if (!amount) {
        return <div className={styles.isLoading} />;
      }
      const defaultEntry = amount.getDefaultEntry();
      const tokenInfo = this.props.getTokenInfo(defaultEntry);
      const shiftedAmount = defaultEntry.amount
            .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
      const ticker = tokenInfo.Metadata.ticker;
      if (ticker == null) {
        throw new Error('unexpected main token type');
      }
      const price = this.props.getCurrentPrice(ticker, currency);
      if (price != null) {
        totalAmount = totalAmount.plus(shiftedAmount.multipliedBy(price));
      } else {
        return '- ' + currency;
      }
    }
    return formatValue(totalAmount) + ' ' + currency;
  }

  onDragEnd: Object => any = async result => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) {
      return;
    }

    this.setState(
      prev => {
        const walletListIdx = reorder(
          prev.walletListIdx,
          result.source.index,
          result.destination.index
        );
        return {
          walletListIdx,
        };
      },
      async function () {
        await this.props.updateSortedWalletList({ sortedWallets: this.state.walletListIdx });
      }
    );
  };

  render(): Node {
    const { intl } = this.context;
    const { walletListIdx } = this.state;

    const {
      shouldHideBalance,
      onAddWallet,
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
        <div className={styles.header}>
          <div className={styles.totalInfo}>
            {this.props.unitOfAccountSetting.enabled && (
              <div className={styles.amount}>
                <p className={styles.label}>{intl.formatMessage(messages.totalBalance)}</p>
                <p className={styles.fixedAmount}>
                  {this.renderWalletSum({
                    shouldHideBalance,
                    walletAmounts: wallets.map(wallet => wallet.walletAmount),
                    rewards: wallets.map(wallet => wallet.rewards),
                  })}
                </p>
              </div>
            )}
            <button type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
              {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="wallet-list-droppable">
            {provided => (
              <div className={styles.list} {...provided.droppableProps} ref={provided.innerRef}>
                {walletListIdx.length > 0 &&
                  walletListIdx.map((walletId, idx) => {
                    const wallet = this.props.wallets.find(w => w.walletId === walletId);
                    // Previously, after a wallet was deleted, the sorted wallet list was not
                    // updated to remove the deleted wallet, so `wallet` might be null.
                    // This should no longer happen but we keep filtering out the null
                    // value (instead of throwing an error) just in case some users
                    // have already deleted wallets before the fix.
                    if (!wallet) {
                      return null;
                    }
                    return (
                      <WalletCard
                        key={walletId}
                        idx={idx}
                        {...wallet}
                        unitOfAccountSetting={this.props.unitOfAccountSetting}
                        getCurrentPrice={this.props.getCurrentPrice}
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
