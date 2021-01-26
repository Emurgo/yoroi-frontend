// @flow
import * as React from 'react';
import type { Node } from 'react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import WalletCard from '../components/WalletCard';
import styles from './Home.scss';

const Home = (): Node => {
  return (
    <>
      <div className={styles.connectWrapper}>
        <div className={styles.image}>
          <img
            src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png"
            alt=""
          />
        </div>
        <div className={styles.title}>
          <h2>Connect to</h2>
          <p>some.loremipsum-dapp1.io</p>
        </div>
      </div>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <Checkbox skin={CheckboxSkin} label="Select all wallets" />
        </li>
        <li className={styles.listItem}>
          <Checkbox skin={CheckboxSkin} label={<WalletCard name="Chris Do" />} />
        </li>
        <li className={styles.listItem}>
          <Checkbox skin={CheckboxSkin} label={<WalletCard name="Chris Do 1" />} />
        </li>
        <li className={styles.listItem}>
          <Checkbox skin={CheckboxSkin} checked label={<WalletCard name="Chris Do 1" />} />
        </li>
      </ul>
      <div className={styles.bottom}>
        <p>Your connection preferences will be saved to your Yoroi dApp list</p>
        <div className={styles.wrapperBtn}>
          <Button className="secondary" label="Cancel" skin={ButtonSkin} />
          <Button label="Connect" skin={ButtonSkin} disabled />
        </div>
      </div>
    </>
  );
};

export default Home;
