// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import globalMessages from '../../i18n/global-messages';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import ChangellyFetcher from './ChangellyFetcher'

import styles from '../widgets/options/OptionListWrapperStyle.scss';

const messages = defineMessages({
  dialogTitle: {
    id: 'buysell.dialog.title',
    defaultMessage: '!!!Buy / Sell ADA',
  },
  dialogDescription: {
    id: 'buysell.dialog.description',
    defaultMessage: '!!!Cardano is the first provably secure proof of stake protocol',
  },
  // testnetDescription: {
  //   id: 'wallet.currency.pick.testnetDescription',
  //   defaultMessage: '!!!Testnet are alternative chain to be used for testing. This allows application developers or testers to experiment, without having to use real coins.',
  // },
  // ergoDescription: {
  //   id: 'wallet.currency.pick.ergo',
  //   defaultMessage: '!!!Ergo builds advanced cryptographic features and radically new DeFi functionality on the rock-solid foundations laid by a decade of blockchain theory and development',
  // },
});

type Props = {|
  +onCancel: void => void,
  // +onSuccess: void => void, // Maybe not so we don't need to hear anything from the iframe
  // +onCardanoTestnet: void => void,
  // +onErgo: void | (void => void),
  // +onExternalLinkClick: MouseEvent => void,
|};

// const WIDGET_URL = '<iframe width="40%" height="40%"
// frameborder="none" src="">Can\'t load widget</iframe>';
const WIDGET_URL = 'https://widget.changelly.com?from=*&to=*&amount=200&address=&fromDefault=usd&toDefault=ada&theme=default&merchant_id=g9qheu8vschp16jj&payment_id=&v=3'

@observer
export default class BuySellDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        closeButton={<DialogCloseButton />}
        className=""
      >
        <div className={styles.component}>
          {intl.formatMessage(messages.dialogDescription)}
          <ChangellyFetcher widgetURL={WIDGET_URL} />
        </div>
      </Dialog>
    );
  }
}
