// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';

import globalMessages from '../../i18n/global-messages';
import styles from './NoWalletsDropdown.scss';

type Props = {|
|};

@observer
export default class NoWalletsDropdown extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.wrapper}>
        <div className={styles.info}>
          {intl.formatMessage(globalMessages.sidebarWallets)}
        </div>
      </div>
    );
  }
}
