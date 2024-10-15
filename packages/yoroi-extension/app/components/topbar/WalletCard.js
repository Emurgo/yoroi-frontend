// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import WalletAccountIcon from './WalletAccountIcon';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { ReactComponent as DragIcon } from '../../assets/images/add-wallet/wallet-list/drag.inline.svg';
import { Draggable } from 'react-beautiful-dnd';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import AmountDisplay from '../common/AmountDisplay';
import { maybe } from '../../coreUtils';
import type { WalletType } from '../../../chrome/extension/background/types';
import { Box, Typography, styled } from '@mui/material';

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

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg path': {
    fill: theme.palette.ds.el_gray_medium,
  },
}));

@observer
export default class WalletCard extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {|
    isCurrentWallet: boolean,
  |} = {
    isCurrentWallet: false,
  };

  render(): Node {
    const { intl } = this.context;
    const { shouldHideBalance, walletId, idx, unitOfAccountSetting, getCurrentPrice, id } = this.props;

    const [walletPlate, iconComponent] = this.props.plate ? constructPlate(this.props.plate, 0, 8, 5, 40, 4) : [];

    const totalAmount = this.getTotalAmount();
    const { tokenTypes, nfts } = this.countTokenTypes();
    const buttonId = `${id}-selectWallet_${idx}-button`;
    const walletNameId = `${id}:walletCard_${idx}-walletName-text`;
    const walletBalanceId = `${id}:walletCard_${idx}`;
    const walletTokensAmountId = `${id}:walletCard_${idx}-walletTokensAmount-text`;
    const walletNFTsAmountId = `${id}:walletCard_${idx}-walletNFTsAmount-text`;

    const draggableBoxBorderColor = (isDragging) => {
      if (isDragging) {
        return 'ds.gray_200';
      }
      if (this.props.isCurrentWallet === true) {
        return 'ds.primary_600';
      }
      return 'transparent';
    }

    return (
      <Box sx={{ background: 'ds.bg_color_max' }} mb="16px">
        <Draggable draggableId={walletId.toString()} index={idx}>
          {(provided, snapshot) => {
            return (
            <Box
              tabIndex="0"
              role="button"
              {...provided.draggableProps}
              ref={provided.innerRef}
              sx={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '8px',
                border: `1px solid`,
                borderColor: draggableBoxBorderColor(snapshot.isDragging),
                '&:hover': {
                  borderColor: this.props.isCurrentWallet !== true && 'ds.gray_300',
                  '& .dragIcon': {
                    opacity: 1,
                  },
                },
                cursor: 'pointer',
                backgroundColor: snapshot.isDragging ? 'ds.bg_color_min' : 'transparent',
                opacity: snapshot.isDragging ? '0.4' : '1',
              }}
            >
              <Box
                role="button"
                tabIndex="0"
                onClick={this.props.onSelect}
                onKeyDown={this.props.onSelect}
                id={buttonId}
              >
                <Box display="flex" gap="24px">
                  {/* Wallet icon, wallet name, wallet plate */}
                  <Box display="flex" gap="8px">
                    {iconComponent}
                    <Box>
                      <Typography
                        id={walletNameId}
                        variant="body2"
                        color="ds.text_gray_medium"
                        fontWeight={500}
                      >
                        {this.props.name}
                      </Typography>
                      <Typography variant="caption1" color="ds.text_gray_low">
                        {walletPlate}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Wallet balance */}
                  <Box sx={{
                    '& .MuiTypography-root': {
                      mt: '0px',
                      mb: '0px',
                    }
                  }}>
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
                  </Box>
                  {/* Tokens amount info */}
                  <Box color='ds.text_gray_medium'>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" marginRight="4px" lineHeight="16px">
                        {intl.formatMessage(messages.tokenTypes)}{':'}
                      </Typography>
                      <Typography variant="caption1" fontWeight={500} lineHeight="16px" id={walletTokensAmountId}>
                        {tokenTypes}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mt="8px">
                      <Typography variant="body2" marginRight="4px" lineHeight="16px">
                        NFTs{':'}
                      </Typography>
                      <Typography variant="caption1" fontWeight={500} lineHeight="16px" id={walletNFTsAmountId}>
                        {nfts}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.3s',
                  opacity: snapshot.isDragging ? 1 : 0,
                }}
                className='dragIcon'
                {...provided.dragHandleProps}
              >
                <IconWrapper>
                  <DragIcon />
                </IconWrapper>
              </Box>
            </Box>
          )}}
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
