// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import styles from './SettingLayout.scss';
import { observer } from 'mobx-react';

import ArrowBack from '../../assets/images/arrow_back.inline.svg';
import TestnetWarningBanner from '../../../components/topbar/banners/TestnetWarningBanner';

type Props = {|
  +headerLabel: string,
  +children: Node,
  +goBack: void => void,
|};

@observer
export default class SettingLayout extends Component<Props> {
  render(): Node {
    const { headerLabel, children, goBack } = this.props;

    return (
      <>
        <TestnetWarningBanner isTestnet={false} />
        <div className={styles.layout}>
          <div className={styles.header}>
            <button onClick={goBack} type="button" className={styles.menuIcon}>
              <ArrowBack />
            </button>
            <div className={styles.menu}>
              <p className={styles.label}>{headerLabel}</p>
            </div>
          </div>
          {children}
        </div>
      </>
    );
  }
}
