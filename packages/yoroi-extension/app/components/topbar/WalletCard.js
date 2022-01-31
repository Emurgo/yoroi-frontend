// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import styles from './WalletCard.scss';
import WalletAccountIcon from './WalletAccountIcon';
import ConceptualIcon from '../../assets/images/wallet-nav/conceptual-wallet.inline.svg';
import TrezorIcon from '../../assets/images/wallet-nav/trezor-wallet.inline.svg';
import LedgerIcon from '../../assets/images/wallet-nav/ledger-wallet.inline.svg';
import { MultiToken } from '../../api/common/lib/MultiToken';
import classnames from 'classnames';
import { truncateToken, splitAmount } from '../../utils/formatters';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { $npm$ReactIntl$IntlFormat, $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import type { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { isCardanoHaskell } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import globalMessages from '../../i18n/global-messages';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { hiddenAmount } from '../../utils/strings';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import DragIcon from '../../assets/images/add-wallet/wallet-list/drag.inline.svg';
import StarIcon from '../../assets/images/add-wallet/wallet-list/star.inline.svg';
import { Draggable } from 'react-beautiful-dnd';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';

const messages = defineMessages({
  tokenTypes: {
    id: 'wallet.topbar.dialog.tokenTypes',
    defaultMessage: '!!!Token types',
  },
});

type Props = {|
  +plate: null | WalletChecksum,
  +wallet: {|
    conceptualWallet: ConceptualWallet,
    conceptualWalletName: string,
  |},
  +rewards: null | void | MultiToken,
  +shouldHideBalance: boolean,
  +walletAmount: null | MultiToken,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +isCurrentWallet?: boolean,
  +onSelect?: void => void,
  +walletId: string,
  +idx: number,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?number,
|};

type State = {| +isActionsShow: boolean |};

function constructPlate(
  plate: WalletChecksum,
  saturationFactor: number,
  divClass: string
): [string, React$Element<'div'>] {
  return [
    plate.TextPart,
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={plate.ImagePart}
        saturationFactor={saturationFactor}
        scalePx={6}
      />
    </div>,
  ];
}

@observer
export default class WalletCard extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {|
    isCurrentWallet: boolean,
    onSelect: void,
  |} = {
    onSelect: undefined,
    isCurrentWallet: false,
  };

  state: State = {
    isActionsShow: false,
  };

  getEra: ConceptualWallet => void | $Exact<$npm$ReactIntl$MessageDescriptor> = wallet => {
    if (!isCardanoHaskell(wallet.getNetworkInfo())) {
      return undefined;
    }
    if (wallet instanceof Bip44Wallet) {
      return globalMessages.byronLabel;
    }
    return globalMessages.shelleyLabel;
  };

  getType: ConceptualWallet => $Exact<$npm$ReactIntl$MessageDescriptor> = wallet => {
    if (isLedgerNanoWallet(wallet)) {
      return globalMessages.ledgerWallet;
    }
    if (isTrezorTWallet(wallet)) {
      return globalMessages.trezorWallet;
    }
    return globalMessages.standardWallet;
  };

  getIcon: ConceptualWallet => string = wallet => {
    if (isLedgerNanoWallet(wallet)) {
      return LedgerIcon;
    }
    if (isTrezorTWallet(wallet)) {
      return TrezorIcon;
    }
    return ConceptualIcon;
  };

  showActions: void => void = () => {
    this.setState({ isActionsShow: true });
  };
  hideActions: void => void = () => {
    this.setState({ isActionsShow: false });
  };

  render(): Node {
    const { intl } = this.context;
    const { shouldHideBalance, walletId, idx } = this.props;
    const { isActionsShow } = this.state;

    const [, iconComponent] = this.props.plate
      ? constructPlate(this.props.plate, 0, styles.icon)
      : [];

    const typeText = [this.getType(this.props.wallet.conceptualWallet)]
      .filter(text => text != null)
      .map(text => intl.formatMessage(text))
      .join(' - ');
    const totalAmount = this.getTotalAmount();
    const { tokenTypes, nfts } = this.countTokenTypes();

    return (
      <Draggable draggableId={walletId.toString()} index={idx}>
        {(provided, snapshot) => (
          <div
            tabIndex="0"
            role="button"
            className={classnames(
              styles.cardWrapper,
              this.props.isCurrentWallet === true && styles.currentCardWrapper,
              snapshot.isDragging === true && styles.isDragging
            )}
            onClick={this.props.onSelect}
            onKeyDown={this.props.onSelect}
            onMouseEnter={this.showActions}
            onMouseLeave={this.hideActions}
            {...provided.draggableProps}
            ref={provided.innerRef}
          >
            <div className={styles.main}>
              <div className={styles.header}>
                <h5 className={styles.name}>{this.props.wallet.conceptualWalletName}</h5>
                {' ·  '}
                <div className={styles.type}>{typeText}</div>
              </div>
              <div className={styles.body}>
                <div>{iconComponent}</div>
                <div className={styles.content}>
                  <div className={styles.amount}>
                    {this.renderAmountDisplay({
                      shouldHideBalance,
                      amount: totalAmount,
                    })}
                  </div>
                {this.props.unitOfAccountSetting.enabled && (
                  <div className={styles.fixedAmount}>
                      {this.renderAmountWithUnitOfAccount({
                        shouldHideBalance,
                        amount: totalAmount,
                      })}
                  </div>
                )}
                </div>
                <div className={styles.extraInfo}>
                  <p className={styles.label}>
                    {intl.formatMessage(messages.tokenTypes)}{' '}
                    <span className={styles.value}>{tokenTypes}</span>
                  </p>
                  <p className={styles.label}>
                    NFTs <span className={styles.value}>{nfts}</span>
                  </p>
                </div>
              </div>
            </div>
            <div
              className={classnames(
                styles.actions,
                (isActionsShow === true || snapshot.isDragging === true) && styles.showActions
              )}
            >
              <div {...provided.dragHandleProps}>
                <DragIcon />
              </div>
              <button type="button" onClick={() => {}}>
                <StarIcon />
              </button>
            </div>
          </div>
        )}
      </Draggable>
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

  renderAmountWithUnitOfAccount: {|
    shouldHideBalance: boolean,
    amount: ?MultiToken
  |} => Node = (request) => {
    if (request.amount == null) {
      return null;
    }
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

    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount
          .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
    const ticker = tokenInfo.Metadata.ticker;
    if (ticker == null) {
      throw new Error('unexpected main token type');
    }
    const price = this.props.getCurrentPrice(ticker, currency);

    let balanceDisplay;
    if (price != null) {
      balanceDisplay = calculateAndFormatValue(shiftedAmount, price);
    } else {
      balanceDisplay = '-';
    }

    return balanceDisplay + ' ' + currency;
  }

  getTotalAmount: void => null | MultiToken = () => {
    if (this.props.rewards === undefined) {
      return this.props.walletAmount;
    }
    if (this.props.rewards === null || this.props.walletAmount === null) {
      return null;
    }
    return this.props.rewards.joinAddCopy(this.props.walletAmount);
  };

  countTokenTypes: void => {|tokenTypes: number, nfts: number|} = () => {
    if (this.props.walletAmount
      && this.props.walletAmount.values
      && Array.isArray(this.props.walletAmount.values)) {
      const count = this.props.walletAmount.values.reduce((prev, curr) => {
        const tokenInfo = this.props.getTokenInfo(curr);
        if (tokenInfo.Identifier !== '' && !tokenInfo.IsDefault) {
          if (tokenInfo.IsNFT === true) {
            prev.nfts++;
          } else {
            prev.tokenTypes++;
          }
        }
        return prev;
      }, { tokenTypes: 0, nfts: 0 });

      return count;
    }

    return {
      tokenTypes: 0,
      nfts: 0
    };
  };
}
