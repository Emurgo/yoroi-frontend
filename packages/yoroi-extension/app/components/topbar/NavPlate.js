// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './NavPlate.scss';
import WalletAccountIcon from './WalletAccountIcon';
import { ReactComponent as ConceptualIcon }  from '../../assets/images/wallet-nav/conceptual-wallet.inline.svg';
import { ReactComponent as TrezorIcon }  from '../../assets/images/wallet-nav/trezor-wallet.inline.svg';
import { ReactComponent as LedgerIcon }  from '../../assets/images/wallet-nav/ledger-wallet.inline.svg';
import { Typography, Tooltip } from '@mui/material';
import { truncateLongName, maxNameLengthBeforeTruncation } from '../../utils/formatters';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { $npm$ReactIntl$IntlFormat, $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import type { WalletType } from '../../../chrome/extension/background/types';

type Props = {|
  +plate: null | WalletChecksum,
  +walletType: WalletType,
  +name: string,
|};

export function constructPlate(
  plate: WalletChecksum,
  saturationFactor: number,
  divClass: string,
): [string, React$Element<'div'>] {
  return [plate.TextPart, (
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={plate.ImagePart}
        saturationFactor={saturationFactor}
        scalePx={6}
      />
    </div>
  )];
}

@observer
export default class NavPlate extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  getType: WalletType => $Exact<$npm$ReactIntl$MessageDescriptor> = (walletType) => {
    if (walletType === 'ledger') {
      return globalMessages.ledgerWallet;
    }
    if (walletType === 'trezor') {
      return globalMessages.trezorWallet;
    }
    return globalMessages.standardWallet;
  }

  getIcon: WalletType => string = (walletType) => {
    if (walletType === 'ledger') {
      return LedgerIcon;
    }
    if (walletType === 'trezor') {
      return TrezorIcon;
    }
    return ConceptualIcon;
  }

  render(): Node {
    const { intl } = this.context;

    const [accountPlateId, iconComponent] = (this.props.plate) ?
      constructPlate(this.props.plate, 0, styles.icon)
      : [];

    const TypeIcon = this.getIcon(this.props.walletType);

    const typeText = intl.formatMessage(this.getType(this.props.walletType));

    return (
      <div className={styles.wrapper}>
        {iconComponent}
        <div className={styles.content}>
          <div className={styles.head}>
            <h3 className={styles.name}>
              {this.generateNameElem(this.props.name)}
            </h3>
            <div className={styles.plate}>{accountPlateId}</div>
          </div>
          <div className={styles.type}>
            {TypeIcon !== undefined &&
              <span className={styles.typeIcon}>
                <TypeIcon />
              </span>
            }
            {typeText}
          </div>
        </div>
      </div>
    );
  }

  generateNameElem: string => Node = (walletName) => {
    if (walletName.length <= maxNameLengthBeforeTruncation) {
      return walletName;
    }

    const truncatedName = truncateLongName(walletName);
    return (
      <Tooltip
        title={
          <Typography component="div" variant="body3">
            {walletName}
          </Typography>
        }
      >
        <Typography component="div" variant="p" fontWeight="500" fontSize="1.125rem" pr="4px">
          {truncatedName}
        </Typography>
      </Tooltip>
    );
  }
}
