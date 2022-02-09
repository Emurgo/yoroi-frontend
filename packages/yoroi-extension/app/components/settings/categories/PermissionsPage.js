// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './PermissionsPage.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import Switch from '../../common/Switch';

const messages = defineMessages({
    cardanoPaymentExplained: {
        id: 'settings.permissions.cardanoPaymentExplained',
        defaultMessage: '!!!Yoroi will allow you to generate special links in Receive page and share it in order to receive payment faster and easier. You can always enable this feature in the Settings.'
    },
    accessToDapps: {
        id: 'settings.permissions.accessToDapps',
        defaultMessage: '!!!Access to dapps'
    },
    accessToDappsExplained: {
        id: 'settings.permissions.accessToDappsExplained',
        defaultMessage: '!!!It will allow you to connect any dapps to Yoroi wallets and enable to participate in any activities that the dApp permits such as purchasing or selling tokens, gaining access to resources, or using other features offered by the dApp.'
    },
});

type Props = {|
    isDappEnabled: boolean,
    requestTabPermission: void => void,
    removeTabPermission: void => void,
|};

@observer
export default class PermissionsPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  togglePermission: void => void = () => {
    const { isDappEnabled, requestTabPermission, removeTabPermission } = this.props

    if (isDappEnabled) {
        removeTabPermission()
        return
    }
    requestTabPermission()
  }

  render(): Node {
    const { intl } = this.context;
    const { isDappEnabled } = this.props

    return (
      <div className={styles.component}>
        {/* <div className={styles.section}>
          <h1 className={styles.header}>
            {intl.formatMessage(globalMessages.uriSchemeLabel)}
          </h1>
          <p className={styles.text}>
            {intl.formatMessage(messages.cardanoPaymentExplained)}
          </p>
          <div className={styles.switch}>
            <Switch />
          </div>
        </div>
        <div className={styles.devider} /> */}
        <div className={styles.section}>
          <h1 className={styles.header}>{intl.formatMessage(messages.accessToDapps)}</h1>
          <p className={styles.text}>{intl.formatMessage(messages.accessToDappsExplained)}</p>
          <div className={styles.switch}>
            <Switch checked={isDappEnabled} onChange={this.togglePermission} />
          </div>
        </div>
      </div>
    );
  }

}
