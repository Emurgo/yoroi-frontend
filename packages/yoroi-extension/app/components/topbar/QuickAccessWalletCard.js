// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './QuickAccessWalletCard.scss'
import { getType } from '../../utils/walletInfo';
import { constructPlate } from './WalletCard';
import { MultiToken } from '../../api/common/lib/MultiToken';
import AmountDisplay from '../common/AmountDisplay';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';

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
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?number,
|}

@observer
export default class QuickAccessWalletCard extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      shouldHideBalance,
      unitOfAccountSetting,
      getCurrentPrice,
    } = this.props;

    const [, iconComponent] = this.props.plate
      ? constructPlate(this.props.plate, 0, styles.main)
      : [];

    const typeText = [getType(this.props.wallet.conceptualWallet)]
      .filter(text => text != null)
      .map(text => intl.formatMessage(text))
      .join(' - ');
    const totalAmount = this.getTotalAmount();

    return (
      <div className={styles.component}>
        <div className={styles.header}>
          <h5 className={styles.name}>{this.props.wallet.conceptualWalletName}</h5>
          {' ·  '}
          <div className={styles.type}>{typeText}</div>
        </div>
        <div className={styles.body}>
          <div>{iconComponent}</div>
          <div className={styles.content}>
            <div className={styles.amount}>
              <AmountDisplay
                shouldHideBalance={shouldHideBalance}
                amount={totalAmount}
                getTokenInfo={this.props.getTokenInfo}
                showFiat
                unitOfAccountSetting={unitOfAccountSetting}
                getCurrentPrice={getCurrentPrice}
              />
            </div>
          </div>
        </div>
      </div>
    )
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
}
