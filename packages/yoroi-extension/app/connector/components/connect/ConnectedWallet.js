// @flow
import type { Node } from 'react';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { Component } from 'react';
import { Box, Typography } from '@mui/material';
import styles from './ConnectedWallet.scss';
import WalletAccountIcon from '../../../components/topbar/WalletAccountIcon';
import type { WalletState } from '../../../../chrome/extension/background/types';

type Props = {|
  +publicDeriver: WalletState,
  +walletBalance?: Node,
  +disabledForReason?: ?string,
|};

function constructPlate(plate: WalletChecksum, saturationFactor: number, divClass: string): [string, React$Element<'div'>] {
  return [
    plate.TextPart,
    <div className={divClass}>
      <WalletAccountIcon iconSeed={plate.ImagePart} saturationFactor={saturationFactor} scalePx={6} />
    </div>,
  ];
}

export default class WalletCard extends Component<Props> {
  static defaultProps: {| walletBalance: void |} = {
    walletBalance: undefined,
  };

  render(): Node {
    const { publicDeriver, walletBalance, disabledForReason } = this.props;
    // eslint-disable-next-line no-unused-vars
    const [_, iconComponent] = publicDeriver.plate ? constructPlate(publicDeriver.plate, 0, styles.icon) : [];

    const checksum = this.props.publicDeriver.plate?.TextPart;

    return (
      <>
        <Box className={styles.card}>
          <div className={styles.wrapper}>
            <div className={styles.avatar}>{iconComponent}</div>
            <div className={styles.nameWrapper}>
              <Typography
                component="div"
                color="ds.gray_900"
                fontWeight="500"
                variant="b1"
                fontSize={16}
                id="connectedWalletName"
              >
                {this.props.publicDeriver.name}
              </Typography>
              <Box sx={{ color: 'ds.gray_600', marginTop: '8px', fontSize: '14px' }} id="connectedWalletPlate">
                {checksum}
              </Box>
            </div>
            {walletBalance != null && <Box sx={{ ml: 'auto' }}>{walletBalance}</Box>}
          </div>
        </Box>
        {disabledForReason && <div className={styles.disabledReason}>{disabledForReason}</div>}
      </>
    );
  }
}
