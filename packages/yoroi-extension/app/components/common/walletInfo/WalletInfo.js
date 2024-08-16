// @flow
import type { Node } from 'react';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { ConceptualWallet } from '../../../api/ada/lib/storage/models/ConceptualWallet/index';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { Typography, Tooltip } from '@mui/material';
import {
  splitAmount,
  truncateToken,
  truncateLongName,
  maxNameLengthBeforeTruncation,
} from '../../../utils/formatters';
import { ReactComponent as IconEyeOpen } from '../../../assets/images/forms/password-eye.inline.svg';
import { ReactComponent as IconEyeClosed } from '../../../assets/images/forms/password-eye-close.inline.svg';
import { hiddenAmount } from '../../../utils/strings';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import styles from './WalletInfo.scss';
import WalletAccountIcon from '../../topbar/WalletAccountIcon';

type Props = {|
  +onUpdateHideBalance: void => Promise<void>,
  +shouldHideBalance: boolean,
  +walletAmount: null | MultiToken,
  +infoText?: string,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +isRefreshing: boolean,
  +plate: null | WalletChecksum,
  +wallet: {|
    conceptualWallet: ConceptualWallet,
    conceptualWalletName: string,
  |},
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
export default class WalletInfo extends Component<Props> {
  static contextTypes: {| infoText: void |} = {
    infoText: undefined,
  };

  render(): Node {
    const { shouldHideBalance, onUpdateHideBalance, walletAmount } = this.props;

    const [accountPlateId, iconComponent] = this.props.plate
      ? constructPlate(this.props.plate, 0, styles.icon)
      : [];

    return (
      <div className={styles.wrapper}>
        <div className={styles.plateAndName}>
          {iconComponent}
          <div className={styles.content}>
            <div className={styles.name} id='walletInfo-walletName-text'>
              {this.generateNameElem(this.props.wallet.conceptualWalletName)}
            </div>
            <div className={styles.type}>
              <div className={styles.plate} id='walletInfo-walletPlate-text'>{accountPlateId}</div>
            </div>
          </div>
        </div>
        <div className={styles.amountAndHideIcon}>
          <div className={styles.amount} id='walletInfo-amount-text'>
            {this.renderAmountDisplay({ shouldHideBalance, amount: walletAmount })}
          </div>
          <button type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
            {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
          </button>
        </div>
      </div>
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
          {afterDecimalRewards}
        </>
      );
    }

    return (
      <>
        {balanceDisplay} {truncateToken(getTokenName(tokenInfo))}
        {this.props.isRefreshing && <div className={styles.isSyncing} />}
      </>
    );
  };

  generateNameElem: string => Node = walletName => {
    if (walletName.length <= maxNameLengthBeforeTruncation) {
      return walletName;
    }

    const truncatedName = truncateLongName(walletName);

    return (
      <Tooltip title={<Typography component="div" variant="body3">{walletName}</Typography>}>
        <Typography component="div" variant="body-2-medium">{truncatedName}</Typography>
      </Tooltip>
    );
  };
}
