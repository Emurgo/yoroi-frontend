// @flow //
import React from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import type { OperationNameType } from '../../../types/enum';
import { OPERATION_NAME } from '../../../types/enum';

import styles from './TitleBlock.scss';

const messages = defineMessages({
  titleConnect: {
    id: 'title.connect',
    defaultMessage: '!!!Connect to Ledger hardware wallet',
  },
  titleSenTx: {
    id: 'title.sendTx',
    defaultMessage: '!!!Send Transaction Using Ledger',
  },
  titleVerifyAddress: {
    id: 'title.verifyAddress',
    defaultMessage: '!!!Verify address on Ledger',
  },
  titleLedgerVersion: {
    id: 'title.ledgerVersion',
    defaultMessage: '!!!Fetch Ledger device version',
  },
  titleLedgerSerial: {
    id: 'title.ledgerSerial',
    defaultMessage: '!!!Fetch Ledger serial number',
  },
  titleDeriveAddress: {
    id: 'title.deriveAddress',
    defaultMessage: '!!!Derive Address',
  },
});

type Props = {|
  currentOperationName: OperationNameType,
|};

@observer
export default class TitleBlock extends React.Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  render() {
    const { intl } = this.context;
    const { currentOperationName } = this.props;

    let title;
    switch (currentOperationName) {
      case OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY:
        title = messages.titleConnect;
        break;
      case OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS:
        title = messages.titleConnect;
        break;
      case OPERATION_NAME.SIGN_TX:
        title = messages.titleSenTx;
        break;
      case OPERATION_NAME.SHOW_ADDRESS:
        title = messages.titleVerifyAddress;
        break;
      case OPERATION_NAME.GET_LEDGER_VERSION:
        title = messages.titleLedgerVersion;
        break;
      case OPERATION_NAME.GET_SERIAL:
        title = messages.titleLedgerSerial;
        break;
      case OPERATION_NAME.DERIVE_ADDRESS:
        title = messages.titleDeriveAddress;
        break;
      default:
        return (null);
    }

    return (
      <div className={styles.component}>
        <div className={styles.title}>{intl.formatMessage(title)}</div>
      </div>
    );
  }
}
