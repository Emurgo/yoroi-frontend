// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { Chip } from '@mui/material';
import styles from './WalletCard.scss';
import WalletAccountIcon from '../../../components/topbar/WalletAccountIcon';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { PublicDeriverCache } from '../../../../chrome/extension/connector/types';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { assetNameFromIdentifier, getTokenName } from '../../../stores/stateless/tokenHelpers';
import { hiddenAmount } from '../../../utils/strings';
import { FiatDisplay } from '../../../components/common/AmountDisplay';

type Props = {|
  +shouldHideBalance: boolean,
  +publicDeriver: PublicDeriverCache,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => ?$ReadOnly<TokenRow>,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
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
        scalePx={9}
        size={8}
      />
    </div>,
  ];
}

export default class WalletCard extends Component<Props> {
  renderWalletTotal({ ticker, shiftedAmount }: {| ticker: string, shiftedAmount: any |}): ?Node {
    const { unitOfAccountSetting, shouldHideBalance, getCurrentPrice } = this.props;
    if (unitOfAccountSetting.enabled) {
      if (ticker == null) {
        throw new Error('unexpected main token type');
      }
      const { currency } = unitOfAccountSetting;
      if (!currency) {
        throw new Error(`unexpected unit of account ${String(currency)}`);
      }
      const price = getCurrentPrice(ticker, currency);
      if (price == null) return null;

      const val = shiftedAmount.multipliedBy(price);

      return <FiatDisplay shouldHideBalance={shouldHideBalance} amount={val} currency={currency} />;
    }
  }
  render(): Node {
    // eslint-disable-next-line no-unused-vars
    const [_, iconComponent] = this.props.publicDeriver.checksum
      ? constructPlate(this.props.publicDeriver.checksum, 0, styles.icon)
      : [];

    const defaultEntry = this.props.publicDeriver.balance.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const numberOfDecimals = tokenInfo ? tokenInfo.Metadata.numberOfDecimals : 0;
    const shiftedAmount = defaultEntry.amount.shiftedBy(-numberOfDecimals);
    const ticker = tokenInfo
      ? getTokenName(tokenInfo)
      : assetNameFromIdentifier(defaultEntry.identifier);

    const { shouldHideBalance } = this.props;
    const checksum = this.props.publicDeriver.checksum?.TextPart;

    return (
      <div className={styles.card}>
        <div className={styles.wrapper}>
          <div className={styles.avatar}>{iconComponent}</div>
          <div className={styles.nameWrapper}>
            <div className={styles.name}>{this.props.publicDeriver.name}</div>
            <Chip label={checksum} size="small" />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className={styles.balance}>
            {shouldHideBalance ? hiddenAmount : shiftedAmount.toString()} <span>{ticker}</span>
          </p>
          <p>{this.renderWalletTotal({ shiftedAmount, ticker })}</p>
        </div>
      </div>
    );
  }
}
