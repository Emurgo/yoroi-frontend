// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import { truncateLongName } from '../../utils/formatters';

import styles from './NavWalletDetailsRevamp.scss';
import { ReactComponent as IconEyeOpen } from '../../assets/images/my-wallets/icon_eye_opened_revamp.inline.svg';
import { ReactComponent as IconEyeClosed } from '../../assets/images/my-wallets/icon_eye_closed_revamp.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import WalletAccountIcon from './WalletAccountIcon';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import AmountDisplay from '../common/AmountDisplay';
import { Box, IconButton, Typography } from '@mui/material';
import { maybe } from '../../coreUtils';

type Props = {|
  +onUpdateHideBalance: void => Promise<void>,
  +shouldHideBalance: boolean,
  +highlightTitle?: boolean,
  +showEyeIcon?: boolean,
  +rewards: MultiToken,
  +walletAmount: ?MultiToken,
  +infoText?: string,
  +showDetails?: boolean,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +defaultToken: $ReadOnly<TokenRow>,
  +plate: null | WalletChecksum,
  +wallet: {|
    conceptualWallet: ConceptualWallet,
    conceptualWalletName: string,
  |},
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +openWalletInfoDialog: () => void,
|};

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
export default class NavWalletDetailsRevamp extends Component<Props> {
  static defaultProps: {|
    highlightTitle: boolean,
    infoText: void,
    showDetails: boolean,
    showEyeIcon: boolean,
  |} = {
    highlightTitle: false,
    infoText: undefined,
    showDetails: true,
    showEyeIcon: true,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      shouldHideBalance,
      onUpdateHideBalance,
      showEyeIcon,
      plate,
      unitOfAccountSetting,
      getCurrentPrice,
      openWalletInfoDialog,
    } = this.props;

    const totalAmount = this.getTotalAmount();
    const showEyeIconSafe = showEyeIcon != null && showEyeIcon;
    const [accountPlateId, iconComponent] = plate ? constructPlate(plate, 0, styles.icon) : [];
    const amountDisplayId = `topBar:selectedWallet`;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          color: 'grayscale.900',
          border: '1px solid',
          borderColor: 'grayscale.300',
          borderRadius: 1,
          height: '48px',
          ':hover': {
            borderColor: 'primary.600',
          },
          transition: 'border-color 300ms ease',
        }}
      >
        <div className={styles.outerWrapper}>
          <button type="button" onClick={openWalletInfoDialog} className={styles.contentWrapper}>
            <div className={classnames([styles.plate])}>{iconComponent}</div>
            <div className={styles.content}>
              <div className={styles.walletInfo}>
                <Typography component="div" variant="body2" fontWeight={500} sx={{ color: 'grayscale.900' }}>
                  {truncateLongName(this.props.wallet.conceptualWalletName)}
                </Typography>
                <Typography component="div" variant="caption1" sx={{ color: 'grayscale.600' }}>
                  {accountPlateId}
                </Typography>
              </div>
              <div className={styles.balance}>
                <Box
                  sx={{ color: 'grayscale.max', height: '100%' }}
                  className={classnames([totalAmount ? styles.amount : styles.spinnerWrapper])}
                >
                  <AmountDisplay
                    shouldHideBalance={shouldHideBalance}
                    amount={totalAmount}
                    getTokenInfo={this.props.getTokenInfo}
                    showFiat
                    unitOfAccountSetting={unitOfAccountSetting}
                    getCurrentPrice={getCurrentPrice}
                    id={amountDisplayId}
                  />
                </Box>
              </div>
            </div>
          </button>
          <IconButton
            disabled={totalAmount === null && !showEyeIconSafe}
            onClick={onUpdateHideBalance}
            sx={{
              bgcolor: 'primary.600',
              width: '46px',
              height: '46px',
              borderTopRightRadius: '6px',
              borderBottomRightRadius: '6px',
              borderTopLeftRadius: '0px',
              borderBottomLeftRadius: '0px',
              ':hover': {
                bgcolor: 'primary.600',
              },
              ':disabled': {
                bgcolor: 'primary.200',
              },
            }}
            color="primary"
          >
            {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
          </IconButton>
        </div>
      </Box>
    );
  }

  getTotalAmount: void => ?MultiToken = () => {
    return maybe(this.props.walletAmount,
      w => this.props.rewards.joinAddCopy(w))
  };
}
