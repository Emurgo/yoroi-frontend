// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './NavDropdownContentRevamp.scss';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { Button } from '@mui/material';

type Props = {|
  +openWalletInfoDialog: void => void,
  +contentComponents?: ?Node,
  +walletsCount?: number,
|};

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
            <Button sx={{ width: '100%' }} onClick={() => openWalletInfoDialog()}>
              {intl.formatMessage(globalMessages.allWalletsLabel)}{' '}
              {walletsCount != null ? <span> ({walletsCount})</span> : null}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
