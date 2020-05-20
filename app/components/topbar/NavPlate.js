// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import styles from './NavPlate.scss';
import WalletAccountIcon from './WalletAccountIcon';
import ConceptualIcon from '../../assets/images/wallet-nav/conceptual-wallet.inline.svg';
import PaperIcon from '../../assets/images/wallet-nav/paper-wallet.inline.svg';
import TrezorIcon from '../../assets/images/wallet-nav/trezor-wallet.inline.svg';
import LedgerIcon from '../../assets/images/wallet-nav/ledger-wallet.inline.svg';
import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';
import { truncateLongName, maxNameLengthBeforeTruncation } from '../../utils/formatters';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  standardWallet: {
    id: 'wallet.nav.type.standard',
    defaultMessage: '!!!Standard wallet',
  },
  paperWallet: {
    id: 'wallet.nav.type.paper',
    defaultMessage: '!!!Paper wallet',
  },
  trezorWallet: {
    id: 'wallet.nav.type.trezor',
    defaultMessage: '!!!Trezor wallet',
  },
  ledgerWallet: {
    id: 'wallet.nav.type.ledger',
    defaultMessage: '!!!Ledger wallet',
  },
});

type Props = {|
  +walletName: string,
  +plate: null | WalletChecksum,
  +walletType: 'standard' | 'paper' | 'trezor' | 'ledger',
|};

function constructPlate(
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

  render(): Node {
    const { plate, walletName, walletType } = this.props;
    const { intl } = this.context;

    const [accountPlateId, iconComponent] = (plate) ?
      constructPlate(plate, 0, styles.icon)
      : [];

    let typeText;
    let TypeIcon;

    switch (walletType) {
      case 'standard':
        typeText = messages.standardWallet;
        TypeIcon = ConceptualIcon;
        break;
      case 'paper':
        typeText = messages.paperWallet;
        TypeIcon = PaperIcon;
        break;
      case 'trezor':
        typeText = messages.trezorWallet;
        TypeIcon = TrezorIcon;
        break;
      case 'ledger':
        typeText = messages.ledgerWallet;
        TypeIcon = LedgerIcon;
        break;
      default:
        typeText = '';
        TypeIcon = undefined;
        break;
    }

    return (
      <div className={styles.wrapper}>
        {iconComponent}
        <div className={styles.content}>
          <div className={styles.head}>
            <h3 className={styles.name}>{this.generateNameElem(walletName)}</h3>
            <div className={styles.plate}>{accountPlateId}</div>
          </div>
          <div className={styles.type}>
            {TypeIcon !== undefined &&
              <span className={styles.typeIcon}>
                <TypeIcon />
              </span>
            }
            {intl.formatMessage(typeText)}
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
        className={styles.SimpleTooltip}
        skin={TooltipSkin}
        isOpeningUpward={false}
        tip={<span className={styles.tooltip}>{walletName}</span>}
      >
        {truncatedName}
      </Tooltip>
    );
  }
}
