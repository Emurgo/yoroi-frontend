// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import type { WalletsNavigation } from '../../api/localStorage';
import { BigNumber } from 'bignumber.js';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { ReactComponent as IconEyeOpen } from '../../assets/images/my-wallets/icon_eye_opened_revamp.inline.svg';
import { ReactComponent as IconEyeClosed } from '../../assets/images/my-wallets/icon_eye_closed_revamp.inline.svg';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Box } from '@mui/system';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import styles from './WalletListDialog.scss';
import WalletCard from './WalletCard';
import globalMessages from '../../i18n/global-messages';
import AmountDisplay from '../common/AmountDisplay';
import type { WalletType } from '../../../chrome/extension/background/types';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { Typography, styled } from '@mui/material';

const messages = defineMessages({
  addWallet: {
    id: 'wallet.nav.addNewWallet',
    defaultMessage: '!!!Add new wallet',
  },
  applyWallet: {
    id: 'wallet.nav.applyNewWallet',
    defaultMessage: '!!!Apply new wallet',
  },
  totalBalance: {
    id: 'wallet.topbar.dialog.totalBalance',
    defaultMessage: '!!!Total Balance',
  },
  cardano: {
    id: 'wallet.topbar.dialog.cardano',
    defaultMessage: '!!!Cardano, ADA',
  },
});

export type WalletInfo = {|
  +plate: null | WalletChecksum,
  +type: WalletType,
  +name: string,
  +rewards: null | void | MultiToken,
  +amount: null | MultiToken,
  +walletId: number,
|};

const IconWrapper = styled(Box)(({ theme }) => ({
  marginTop: '32px',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

type Props = {|
  +close: void => void,
  +shouldHideBalance: boolean,
  +onUpdateHideBalance: void => Promise<void>,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +walletAmount: ?MultiToken,
  +onAddWallet: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +cardanoWallets: Array<WalletInfo>,
  +walletsNavigation: WalletsNavigation,
  +updateSortedWalletList: WalletsNavigation => Promise<void>,
  +onSelect: (number) => void,
  +selectedWalletId: ?number,
|};
type State = {|
  cardanoWalletsIdx: number[],
  selectedWalletId: number | null,
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

  return generatedWalletIds;
};
@observer
export default class WalletListDialog extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  state: State = {
    cardanoWalletsIdx: [],
    selectedWalletId: null,
  };

  async componentDidMount(): Promise<void> {
    const cardanoWalletsId = getGeneratedWalletIds(
      this.props.walletsNavigation.cardano,
      this.props.cardanoWallets.map(wallet => wallet.walletId)
    );

    this.setState(
      {
        cardanoWalletsIdx: cardanoWalletsId,
        selectedWalletId: this.props.selectedWalletId,
      },
      async () => {
        await this.props.updateSortedWalletList({
          cardano: cardanoWalletsId,
        });
      }
    );
  }

  onDragEnd: (network: 'cardano', result: Object) => any = async (network, result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) {
      return;
    }

    this.setState(
      prev => {
        const walletListIdx = reorder(prev.cardanoWalletsIdx, result.source.index, result.destination.index);
        return {
          cardanoWalletsIdx: walletListIdx,
        };
      },
      async function () {
        await this.props.updateSortedWalletList({
          cardano: this.state.cardanoWalletsIdx,
        });
      }
    );
  };

  onSelect: void => void = () => {
    const { selectedWalletId } = this.state;
    if (selectedWalletId === null) return;
    this.props.onSelect(selectedWalletId);
    this.props.close();
  };

  isCurrentWallet(walletId: number, compareWith: 'local' | 'global'): boolean {
    const selectedWalletId =
      compareWith === 'local' ? this.state.selectedWalletId : this.props.selectedWalletId;
    return walletId === selectedWalletId;
  }

  render(): Node {
    const { intl } = this.context;
    const { cardanoWalletsIdx } = this.state;

    const {
      shouldHideBalance,
      onAddWallet,
      onUpdateHideBalance,
      cardanoWallets,
      unitOfAccountSetting,
      getCurrentPrice,
    } = this.props;

    const walletsTotal = this.renderWalletsTotal();

    return (
      <Dialog
        className={styles.component}
        title={intl.formatMessage(globalMessages.changeWallet)}
        closeOnOverlayClick
        closeButton={<DialogCloseButton />}
        onClose={this.props.close}
        actions={[
          {
            id: 'changeWalletDialog-addWallet-button',
            onClick: onAddWallet,
            size: 'large',
            label: intl.formatMessage(messages.addWallet),
          },
          {
            id: 'changeWalletDialog-applyWallet-button',
            onClick: this.onSelect,
            size: 'large',
            disabled:
              this.state.selectedWalletId === null ||
              this.isCurrentWallet(this.state.selectedWalletId, 'global'),
            primary: true,
            label: intl.formatMessage(messages.applyWallet),
          },
        ]}
        scrollableContentClass="WalletList"
        id="changeWalletDialog"
      >
        <Box>
          <div className={styles.header}>
            <div className={styles.totalInfo}>
              {walletsTotal !== undefined && (
                <div className={styles.amount}>
                  <Typography variant="body2" mb="4px" color="ds.text_gray_medium">
                    {intl.formatMessage(messages.totalBalance)}
                  </Typography>
                  <Typography variant="body1" mt="10px" fontWeight="500" color="ds.text_gray_medium">
                    {walletsTotal}
                  </Typography>
                </div>
              )}
              <button type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
                {shouldHideBalance ? (
                  <IconWrapper>
                    <IconEyeClosed />
                  </IconWrapper>
                ) : (
                  <IconWrapper>
                    <IconEyeOpen />
                  </IconWrapper>
                )}
              </button>
            </div>
          </div>
          <Box
            className="WalletList"
            sx={{ overflow: 'auto', overflowY: 'auto', height: '400px' }}
            id="changeWalletDialog-walletList-box"
          >
            {cardanoWalletsIdx.length > 0 && (
              <div className={styles.sectionHeader}>
                <h1>{intl.formatMessage(messages.cardano)}</h1>
              </div>
            )}
            <DragDropContext onDragEnd={result => this.onDragEnd('cardano', result)}>
              <Droppable droppableId="cardano-list-droppable">
                {provided => (
                  <div className={styles.list} {...provided.droppableProps} ref={provided.innerRef}>
                    {cardanoWalletsIdx.length > 0 &&
                      cardanoWalletsIdx
                        .map((walletId, idx) => {
                          const wallet = cardanoWallets.find(w => w.walletId === walletId);
                          if (!wallet) {
                            return null;
                          }

                          return (
                            <WalletCard
                              key={walletId}
                              idx={idx}
                              onSelect={() => this.setState({ selectedWalletId: wallet.walletId })}
                              isCurrentWallet={this.isCurrentWallet(wallet.walletId, 'local')}
                              plate={wallet.plate}
                              type={wallet.type}
                              name={wallet.name}
                              rewards={wallet.rewards}
                              shouldHideBalance={this.props.shouldHideBalance}
                              walletAmount={wallet.amount}
                              walletId={walletId}
                              getTokenInfo={this.props.getTokenInfo}
                              unitOfAccountSetting={unitOfAccountSetting}
                              getCurrentPrice={getCurrentPrice}
                              id="changeWalletDialog:walletsList"
                            />
                          );
                        })
                        .filter(Boolean)}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Box>
      </Dialog>
    );
  }

  renderWalletsTotal(): ?Node {
    const { unitOfAccountSetting, cardanoWallets, shouldHideBalance, getCurrentPrice } = this.props;
    return (
      <AmountDisplay
        shouldHideBalance={shouldHideBalance}
        amount={this.sumWallets(cardanoWallets).sum}
        getTokenInfo={this.props.getTokenInfo}
        showFiat={false}
        showAmount
        unitOfAccountSetting={unitOfAccountSetting}
        getCurrentPrice={getCurrentPrice}
        id="changeWalletDialog:total"
      />
    );
  }

  sumWallets(
    wallets: Array<WalletInfo>
  ): {|
    sum: MultiToken | null,
    fiat: BigNumber | null,
  |} {
    const { unitOfAccountSetting, getTokenInfo, getCurrentPrice } = this.props;
    if (wallets.length === 0) {
      return { sum: null, fiat: new BigNumber('0') };
    }
    let sum;
    if (wallets[0].amount) {
      sum = new MultiToken(wallets[0].amount.values, wallets[0].amount.defaults);
    } else {
      return { sum: null, fiat: null };
    }

    if (wallets[0].rewards) {
      sum.joinAddMutable(wallets[0].rewards);
    }

    for (let i = 1; i < wallets.length; i++) {
      if (wallets[i].amount) {
        sum.joinAddMutable(
          new MultiToken(
            // treat TADA as ADA or vice versa
            wallets[i].amount.values.map(v => ({
              ...v,
              networkId: sum.getDefaults().defaultNetworkId,
            })),
            sum.getDefaults()
          )
        );
      } else {
        return { sum: null, fiat: null };
      }

      if (wallets[i].rewards) {
        sum.joinAddMutable(
          new MultiToken(
            // treat TADA as ADA or vice versa
            wallets[i].rewards.values.map(v => ({
              ...v,
              networkId: sum.getDefaults().defaultNetworkId,
            })),
            sum.getDefaults()
          )
        );
      }
    }
    if (!unitOfAccountSetting.enabled) {
      return { sum, fiat: null };
    }
    const defaultEntry = sum.getDefaultEntry();
    const tokenInfo = getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
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
