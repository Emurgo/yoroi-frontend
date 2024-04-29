// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import styles from './WalletSyncingOverlay.scss';
import Dialog from '../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../widgets/Dialog/DialogCloseButton';
import LoadingSpinner from '../../widgets/LoadingSpinner';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +classicTheme: boolean,
  +onClose: void => PossiblyAsync<void>,
|};

const messages = defineMessages({
  title: {
    id: 'wallet.syncingOverlay.title',
    defaultMessage: '!!!Wallet Syncing',
  },
  explanation: {
    id: 'wallet.syncingOverlay.explanation',
    defaultMessage: '!!!Please wait while we process wallet data. This may take some time.'
  },
  returnBtnLabel: {
    id: 'wallet.syncingOverlay.return',
    defaultMessage: '!!!Return to my wallets'
  }
})
@observer
export default class WalletSyncingOverlay extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const actions = this.props.onClose == null
      ? undefined
      : [{
        label: intl.formatMessage(messages.returnBtnLabel),
        onClick: this.props.onClose,
        primary: true
      }];

    return (
      <Dialog
        title=""
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onClose ? this.props.onClose : undefined}
        className={styles.dialog}
        closeButton={this.props.onClose ? (<DialogCloseButton />) : undefined}
      >
        <div className={styles.component}>
          <div>
            <div className={styles.successImg} />
            <div className={styles.title}>
              {intl.formatMessage(messages.title)}
            </div>
            <div className={styles.text}>
              {intl.formatMessage(messages.explanation)}
            </div>
            <div className={styles.spinnerSection}>
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}
