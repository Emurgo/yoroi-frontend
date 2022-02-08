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

type Props = {||};

@observer
export default class PermissionsPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;


    return (
      <div className={styles.component}>
        <div>
          <h1>{intl.formatMessage(globalMessages.uriSchemeLabel)}</h1>
          <p>{intl.formatMessage(messages.cardanoPaymentExplained)}</p>
          <Switch />
        </div>
        <div>
          <h1>{intl.formatMessage(messages.accessToDapps)}</h1>
          <p>{intl.formatMessage(messages.accessToDappsExplained)}</p>
          <Switch />
        </div>
      </div>
    );
  }

}
