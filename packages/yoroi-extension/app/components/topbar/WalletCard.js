// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat, $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import styles from './WalletCard.scss';
import WalletAccountIcon from './WalletAccountIcon';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import { MultiToken } from '../../api/common/lib/MultiToken';
import classnames from 'classnames';
import type { WalletChecksum } from '@emurgo/cip4-js';
import globalMessages from '../../i18n/global-messages';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { ReactComponent as DragIcon } from '../../assets/images/add-wallet/wallet-list/drag.inline.svg';
import { Draggable } from 'react-beautiful-dnd';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import AmountDisplay from '../common/AmountDisplay';
import { maybe } from '../../coreUtils';
import type { WalletType } from '../../../chrome/extension/background/types';
import { Box, Typography } from '@mui/material';

const messages = defineMessages({
  tokenTypes: {
    id: 'wallet.topbar.dialog.tokenTypes',
    defaultMessage: '!!!Token types',
  },
});

type Props = {|
  +plate: null | WalletChecksum,
  +type: WalletType,
  +name: string,
  +rewards: null | void | MultiToken,
  +shouldHideBalance: boolean,
  +walletAmount: null | MultiToken,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +isCurrentWallet?: boolean,
  +onSelect: void => void,
  +walletId: number,
  +idx: number,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
  id: string,
|};

type State = {| +isActionsShow: boolean |};

export function constructPlate(
  plate: WalletChecksum,
  saturationFactor: number,
  size: number,
  scalePx: number,
  iconSize: number,
  borderRadius: number,
): [string, React$Element<'div'>] {
  return [plate.TextPart, (
    <Box
      sx={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        borderRadius: `${borderRadius}px`,
        alignItems: 'center',
        justifyContent: 'center',
        '& .identicon': {
          borderRadius: `${borderRadius}px`,
        },
      }}
    >
      <WalletAccountIcon
        iconSeed={plate.ImagePart}
        saturationFactor={saturationFactor}
        size={size}
        scalePx={scalePx}
      />
    </Box>
  )];
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

  getType: WalletType => $Exact<$npm$ReactIntl$MessageDescriptor> = type => {
    if (type === 'ledger') {
      return globalMessages.ledgerWallet;
    }
    if (type === 'trezor') {
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
    const { shouldHideBalance, walletId, idx, unitOfAccountSetting, getCurrentPrice, id } = this.props;
    const { isActionsShow } = this.state;

    const [, iconComponent] = this.props.plate ? constructPlate(this.props.plate, 0, 8, 5, 40, 4) : [];

    const typeText = [this.getType(this.props.type)]
      .filter(text => text != null)
      .map(text => intl.formatMessage(text))
      .join(' - ');
    const totalAmount = this.getTotalAmount();
    const { tokenTypes, nfts } = this.countTokenTypes();
    const buttonId = `${id}-selectWallet_${idx}-button`;
    const walletNameId = `${id}:walletCard_${idx}-walletName-text`;
    const walletBalanceId = `${id}:walletCard_${idx}`;
    const walletTokensAmountId = `${id}:walletCard_${idx}-walletTokensAmount-text`;
    const walletNFTsAmountId = `${id}:walletCard_${idx}-walletNFTsAmount-text`;

    return (
      <Box sx={{ background: 'ds.bg_color_max' }} mb="16px">
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
                id={buttonId}
              >
                <div className={styles.header}>
                  <Typography id={walletNameId} variant="body2" color="ds.text_gray_medium" mr="5px">
                    {this.props.name}
                  </Typography>
                  {' ·  '}
                  <Typography variant="body2" color="ds.text_gray_medium" ml="5px">
                    {typeText}
                  </Typography>
                </div>
                <div className={styles.body}>
                  {iconComponent}
                  <div className={styles.content}>
                    <AmountDisplay
                      shouldHideBalance={shouldHideBalance}
                      amount={totalAmount}
                      getTokenInfo={this.props.getTokenInfo}
                      showFiat
                      showAmount
                      unitOfAccountSetting={unitOfAccountSetting}
                      getCurrentPrice={getCurrentPrice}
                      id={walletBalanceId}
                    />
                  </div>
                  <div className={styles.extraInfo}>
                    <div className={styles.label}>
                      {intl.formatMessage(messages.tokenTypes)}{' '}
                      <span className={styles.value} id={walletTokensAmountId}>
                        {tokenTypes}
                      </span>
                    </div>
                    <div className={styles.label}>
                      NFTs{' '}
                      <span className={styles.value} id={walletNFTsAmountId}>
                        {nfts}
                      </span>
                    </div>
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
              </div>
            </div>
          )}
        </Draggable>
      </Box>
    );
  }

  getTotalAmount: void => ?MultiToken = () => {
    return maybe(this.props.walletAmount, w => this.props.rewards?.joinAddCopy(w) ?? w);
  };

  countTokenTypes: void => {| tokenTypes: number, nfts: number |} = () => {
    if (this.props.walletAmount && this.props.walletAmount.values && Array.isArray(this.props.walletAmount.values)) {
      const count = this.props.walletAmount.values.reduce(
        (prev, curr) => {
          const tokenInfo = this.props.getTokenInfo(curr);
          if (tokenInfo.Identifier !== '' && !tokenInfo.IsDefault) {
            if (tokenInfo.IsNFT === true) {
              prev.nfts++;
            } else {
              prev.tokenTypes++;
            }
          }
          return prev;
        },
        { tokenTypes: 0, nfts: 0 }
      );

      return count;
    }

    return {
      tokenTypes: 0,
      nfts: 0,
    };
  };
}
