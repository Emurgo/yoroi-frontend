// @flow
import React, { Component } from 'react';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import type { WalletAccountNumberPlate } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { intlShape, defineMessages } from 'react-intl';
import styles from './NavPlate.scss';
import WalletAccountIcon from './WalletAccountIcon';
import ConceptualIcon from '../../assets/images/wallet-nav/conceptual-wallet.inline.svg';
import PaperIcon from '../../assets/images/wallet-nav/paper-wallet.inline.svg';
import TrezorIcon from '../../assets/images/wallet-nav/trezor-wallet.inline.svg';

const messages = defineMessages({
  conceptualWallet: {
    id: 'wallet.nav.type.conceptual',
    defaultMessage: '!!!Conceptual wallet',
  },
  paperWallet: {
    id: 'wallet.nav.type.paper',
    defaultMessage: '!!!Paper wallet',
  },
  trezorWallet: {
    id: 'wallet.nav.type.trezor',
    defaultMessage: '!!!Trezor wallet',
  },
});

type Props = {|
  +walletName: string,
  +publicDeriver: null | PublicDeriverWithCachedMeta,
  +walletType: 'conceptual' | 'paper' | 'trezor',
|};

function constructPlate(
  plate: WalletAccountNumberPlate,
  saturationFactor: number,
  divClass: string,
): [string, React$Element<'div'>] {
  return [plate.id, (
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={plate.hash}
        saturationFactor={saturationFactor}
        scalePx={6}
      />
    </div>
  )];
}

export default class NavPlate extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { publicDeriver, walletName, walletType } = this.props;
    const { intl } = this.context;

    const [accountPlateId, iconComponent] = (publicDeriver && publicDeriver.plate) ?
      constructPlate(publicDeriver.plate, 0, styles.icon)
      : [];

    let typeText;
    let TypeIcon;

    switch (walletType) {
      case 'conceptual':
        typeText = messages.conceptualWallet;
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
            <h3 className={styles.name}>{walletName}</h3>
            {accountPlateId}
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
}
