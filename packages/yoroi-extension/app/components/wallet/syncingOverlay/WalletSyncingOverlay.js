// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './WalletSyncingOverlay.scss';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import LoadingSpinner from '../../widgets/LoadingSpinner';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +classicTheme: boolean,
  +onClose: void => PossiblyAsync<void>,
|};

@observer
export default class WalletSyncingOverlay extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const actions = this.props.onClose == null
      ? undefined
      : [{
        label: 'Return to my wallets',
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
              {'Wallet Syncing'}
            </div>
            <div className={styles.text}>
              {'Please wait....'}
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
