// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import styles from './WalletCard.scss';
import WalletAccountIcon from './WalletAccountIcon';
import { MultiToken } from '../../api/common/lib/MultiToken';
import classnames from 'classnames';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { $npm$ReactIntl$IntlFormat, $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import type { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import globalMessages from '../../i18n/global-messages';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { ReactComponent as DragIcon }  from '../../assets/images/add-wallet/wallet-list/drag.inline.svg';
import { ReactComponent as StarIcon }  from '../../assets/images/add-wallet/wallet-list/star.inline.svg';
import { ReactComponent as StaredIcon }  from '../../assets/images/add-wallet/wallet-list/stared.inline.svg';

import { Draggable } from 'react-beautiful-dnd';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { Tooltip, Typography } from '@mui/material';
import AmountDisplay from '../common/AmountDisplay';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';

const messages = defineMessages({
  tokenTypes: {
    id: 'wallet.topbar.dialog.tokenTypes',
    defaultMessage: '!!!Token types',
  },
  quickAccessTooltip: {
    id: 'wallet.topbar.dialog.quickAccess',
    defaultMessage: '!!!Add to quick acceess wallets list',
  }
});

type Props = {|
  +plate: null | WalletChecksum,
  +settingsCache: {|
    conceptualWallet: ConceptualWallet,
    conceptualWalletName: string,
  |},
  +wallet: PublicDeriver<>,
  +rewards: null | void | MultiToken,
  +shouldHideBalance: boolean,
  +walletAmount: null | MultiToken,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +isCurrentWallet?: boolean,
  +onSelect: void => void,
  +walletId: string,
  +idx: number,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +toggleQuickAccess: string => void,
  +isInQuickAccess: boolean,
|};

type State = {| +isActionsShow: boolean |};

export function constructPlate(
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
  |} = {
    isCurrentWallet: false,
  };

  state: State = {
    isActionsShow: false,
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

  showActions: void => void = () => {
    this.setState({ isActionsShow: true });
  };

  hideActions: void => void = () => {
    this.setState({ isActionsShow: false });
  };

  render(): Node {
    const { intl } = this.context;
    const {
      shouldHideBalance,
      walletId,
      idx,
      unitOfAccountSetting,
      getCurrentPrice,
    } = this.props;
    const { isActionsShow } = this.state;

    const [, iconComponent] = this.props.plate
      ? constructPlate(this.props.plate, 0, styles.icon)
      : [];

    const typeText = [this.getType(this.props.settingsCache.conceptualWallet)]
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
            onMouseEnter={this.showActions}
            onMouseLeave={this.hideActions}
            {...provided.draggableProps}
            ref={provided.innerRef}
          >
            <div
              className={styles.main}
              role="button"
              tabIndex="0"
              onClick={this.props.onSelect}
              onKeyDown={this.props.onSelect}
            >
              <div className={styles.header}>
                <h5 className={styles.name}>{this.props.settingsCache.conceptualWalletName}</h5>
                {' ·  '}
                <div className={styles.type}>{typeText}</div>
              </div>
              <div className={styles.body}>
                <div>{iconComponent}</div>
                <div className={styles.content}>
                  <AmountDisplay
                    shouldHideBalance={shouldHideBalance}
                    amount={totalAmount}
                    getTokenInfo={this.props.getTokenInfo}
                    showFiat
                    showAmount
                    unitOfAccountSetting={unitOfAccountSetting}
                    getCurrentPrice={getCurrentPrice}
                  />
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
              {!this.props.isInQuickAccess &&
                <Tooltip
                  title={
                    <Typography variant="body3">
                      {intl.formatMessage(messages.quickAccessTooltip)}
                    </Typography>
                  }
                  placement="bottom-end"
                >
                  <button type="button" onClick={() => this.props.toggleQuickAccess(this.props.walletId)}>
                    <StarIcon />
                  </button>
                </Tooltip>}
            </div>
            {this.props.isInQuickAccess &&
            <button
              className={styles.quickAccessToggle}
              onClick={() => this.props.toggleQuickAccess(this.props.walletId)}
              type='button'
            >
              <StaredIcon />
            </button>}
          </div>
        )}
      </Draggable>
    );
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
