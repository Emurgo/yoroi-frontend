// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './NavDropdownContentRevamp.scss';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +openWalletInfoDialog: void => void,
  +contentComponents?: ?Node,
  +walletsCount?: number,
|};

const messages = defineMessages({
  allWalletsLabel: {
    id: 'wallet.nav.allWalletsLabel',
    defaultMessage: '!!!All wallets',
  },
});
@observer
export default class NavDropdownContentRevamp extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  static defaultProps: {| contentComponents: void, walletsCount: void |} = {
    contentComponents: undefined,
    walletsCount: undefined,
  };

  render(): Node {
    const { contentComponents, walletsCount, openWalletInfoDialog } = this.props;
    const { intl } = this.context;

    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          {contentComponents}
          <div className={styles.footer}>
            <button type="button" onClick={() => openWalletInfoDialog()}>
              {intl.formatMessage(messages.allWalletsLabel)}{' '}
              {walletsCount != null ? <span> ({walletsCount})</span> : null}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
