// @flow
import * as React from 'react';
import type { Node } from 'react';
import styles from './WalletCard.scss';

type WalletCardProps = {|
  name: string,
|};
const WalletCard = ({ name }: WalletCardProps): Node => {
  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/20/Lcd_display_dead_pixel.jpg"
          alt=""
        />
      </div>
      <div className={styles.name}>{name}</div>
      <p>
        65.<span>000000</span> ADA
      </p>
    </div>
  );
};

export default WalletCard;
