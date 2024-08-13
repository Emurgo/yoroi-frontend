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
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import styles from './WalletListDialog.scss';
import WalletCard from './WalletCard';
import globalMessages from '../../i18n/global-messages';
import AmountDisplay, { FiatDisplay } from '../common/AmountDisplay';
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

const IconWrapper = styled(Box)(({ theme }) => ({
  marginTop: '32px',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_normal,
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
  +cardanoWallets: Array<Object>,
  +walletsNavigation: WalletsNavigation,
  +updateSortedWalletList: WalletsNavigation => Promise<void>,
  +onSelect: (PublicDeriver<>) => void,
  +selectedWallet: null | PublicDeriver<>,
|};
type State = {|
  cardanoWalletsIdx: number[],
  selectedWallet: PublicDeriver<> | null,
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
    selectedWallet: null,
  };

  async componentDidMount(): Promise<void> {
    const cardanoWalletsId = getGeneratedWalletIds(
      this.props.walletsNavigation.cardano,
      this.props.cardanoWallets.map(wallet => wallet.walletId)
    );

    this.setState(
      {
        cardanoWalletsIdx: cardanoWalletsId,
        selectedWallet: this.props.selectedWallet,
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
    const { selectedWallet } = this.state;
    if (selectedWallet === null) return;
    this.props.onSelect(selectedWallet);
    this.props.close();
  };

  isCurrentWallet(wallet: PublicDeriver<>, compareWith: 'local' | 'global'): boolean {
    const selectedWallet = compareWith === 'local' ? this.state.selectedWallet : this.props.selectedWallet;
    return wallet.getPublicDeriverId() === selectedWallet?.getPublicDeriverId();
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
            disabled: this.state.selectedWallet === null || this.isCurrentWallet(this.state.selectedWallet, 'global'),
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
                  <Typography variant="body2" mb="4px" color="ds.text_gray_normal">
                    {intl.formatMessage(messages.totalBalance)}
                  </Typography>
                  <Typography variant="body1" mt="10px" fontWeight="500" color="ds.text_gray_normal">
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
                              onSelect={() => this.setState({ selectedWallet: wallet.wallet })}
                              isCurrentWallet={this.isCurrentWallet(wallet.wallet, 'local')}
                              {...wallet}
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
    if (unitOfAccountSetting.enabled) {
      const adaFiat = this.sumWallets(cardanoWallets).fiat;
      if (adaFiat != null) {
        const totalFiat = adaFiat;
        const { currency } = unitOfAccountSetting;
        return <FiatDisplay shouldHideBalance={shouldHideBalance} amount={totalFiat} currency={currency} />;
      }
    }
    // either unit of account is not enabled, or fails to convert to fiat
    const amount = this.sumWallets(cardanoWallets).sum;
    const totalAmountId = `changeWalletDialog:total`;
    return (
      <AmountDisplay
        shouldHideBalance={shouldHideBalance}
        amount={amount}
        getTokenInfo={this.props.getTokenInfo}
        showFiat={false}
        showAmount
        unitOfAccountSetting={unitOfAccountSetting}
        getCurrentPrice={getCurrentPrice}
        id={totalAmountId}
      />
    );
  }

  sumWallets(
    wallets: Array<Object>
  ): {|
    sum: MultiToken | null,
    fiat: BigNumber | null,
  |} {
    const { unitOfAccountSetting, getTokenInfo, getCurrentPrice } = this.props;
    if (wallets.length === 0) {
      return { sum: null, fiat: new BigNumber('0') };
    }
    let sum;
    if (wallets[0].walletAmount) {
      sum = new MultiToken(wallets[0].walletAmount.values, wallets[0].walletAmount.defaults);
    } else {
      return { sum: null, fiat: null };
    }

    if (wallets[0].rewards) {
      sum.joinAddMutable(wallets[0].rewards);
    }

    for (let i = 1; i < wallets.length; i++) {
      if (wallets[i].walletAmount) {
        sum.joinAddMutable(
          new MultiToken(
            // treat TADA as ADA or vice versa
            wallets[i].walletAmount.values.map(v => ({
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
