// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { connectorMessages } from '../../../i18n/global-messages';


type Props = {||}
type State = {|
  hasPermission: boolean,
|}

/*::
declare var chrome;
*/
@observer
export default class DappConnectorNavbar extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context
    return (
      <div className={styles.component}>
        <h1 className={styles.header}>{intl.formatMessage(connectorMessages.dappConnector)}</h1>
      </div>
    )
  }
}