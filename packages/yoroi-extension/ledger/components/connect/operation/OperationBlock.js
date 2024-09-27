// @flow //
import React from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import type {
  DeviceCodeType,
  OperationNameType,
  ProgressStateType,
}  from '../../../types/enum';
import {
  OPERATION_NAME,
  PROGRESS_STATE,
} from '../../../types/enum';
import LoadingSpinner from '../../widgets/LoadingSpinner';
import CommonHintBlock from './common/CommonHintBlock';
import ConnectLedgerHintBlock from './connect/ConnectLedgerHintBlock';
import ConnectLedgerMultiKeysHintBlock from './connect/ConnectLedgerMultiKeysHintBlock';
import SendTxHintBlock from './send/SendTxHintBlock';
import VerifyAddressHintBlock from './verify/VerifyAddressHintBlock';
import DeriveAddressHintBlock from './derive/DeriveAddressHintBlock';
import SignMessageBlock from './send/SignMessageBlock';

import type {
  DeriveAddressRequest,
  SignTransactionRequest,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type { ShowAddressRequestWrapper } from '../../../types/cmn';

import styles from './OperationBlock.scss';

const message = defineMessages({
  topInfo: {
    id: 'operation.top.ledgerDeviceInfo',
    defaultMessage: '!!!Perform the following actions on your Ledger'
  },
});

type Props = {|
  deviceCode: DeviceCodeType,
  currentOperationName: OperationNameType,
  progressState: ProgressStateType,
  signTxInfo: SignTransactionRequest,
  verifyAddressInfo: ShowAddressRequestWrapper,
  deriveAddressInfo: DeriveAddressRequest,
  wasDeviceLocked: boolean,
  showPerformActionText?: boolean,
  deviceVersion: ?string,
|};

@observer
export default class OperationBlock extends React.Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired
  };
  static defaultProps: {| showPerformActionText: boolean |} = {
    showPerformActionText: false
  }
  // Yoroi styled loading spinner
  loadingSpinner: ?LoadingSpinner;

  render(): Node {
    const { intl } = this.context;
    const {
      deviceCode,
      currentOperationName,
      progressState,
      signTxInfo,
      verifyAddressInfo,
      deriveAddressInfo,
      wasDeviceLocked,
      showPerformActionText,
      deviceVersion,
    } = this.props;

    let content;
    switch (progressState) {
      case PROGRESS_STATE.DEVICE_TYPE_SELECTED:
        content = (
          <LoadingSpinner ref={(component) => { this.loadingSpinner = component; }} />
        );
        break;
      case PROGRESS_STATE.DETECTING_DEVICE:
        content = (
          <CommonHintBlock
            deviceCode={deviceCode}
            progressState={progressState}
          />
        );
        break;
      case PROGRESS_STATE.DEVICE_FOUND:
        // Select hint by operation
        switch (currentOperationName) {
          case OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY:
            content = (
              <ConnectLedgerHintBlock
                deviceCode={deviceCode}
                wasDeviceLocked={wasDeviceLocked}
              />
            );
            break;
          case OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS:
            content = (
              <ConnectLedgerMultiKeysHintBlock
                deviceCode={deviceCode}
                wasDeviceLocked={wasDeviceLocked}
              />
            );
            break;
          case OPERATION_NAME.SIGN_TX:
            content = (
              <SendTxHintBlock
                deviceCode={deviceCode}
                signTxInfo={signTxInfo}
                wasDeviceLocked={wasDeviceLocked}
                deviceVersion={deviceVersion}
              />
            );
            break;
          case OPERATION_NAME.SHOW_ADDRESS:
            content = (
              <VerifyAddressHintBlock
                deviceCode={deviceCode}
                verifyAddressInfo={verifyAddressInfo}
                wasDeviceLocked={wasDeviceLocked}
              />
            );
            break;
          case OPERATION_NAME.DERIVE_ADDRESS:
            content = (
              <DeriveAddressHintBlock
                deviceCode={deviceCode}
                deriveAddressInfo={deriveAddressInfo}
                wasDeviceLocked={wasDeviceLocked}
              />
            );
            break;
          case OPERATION_NAME.SIGN_MESSAGE:
            content = (
              <SignMessageBlock
                deviceCode={deviceCode}
                wasDeviceLocked={wasDeviceLocked}
                deviceVersion={deviceVersion}
              />
            );
            break;
          default:
            console.error(`[YLC] Unexpected operation: ${currentOperationName}`);
            return (null);
        }
        break;
      default:
        console.error(`[YLC] Unexpected progress state: ${progressState}`);
        return (null);
    }

    // By default performActionText block is hidden
    let performActionText;
    if (showPerformActionText === true) {
      performActionText = (
        <div className={styles.performActionText}>
          {intl.formatMessage(message.topInfo)}
        </div>
      );
    }

    return (
      <div className={styles.component}>
        {performActionText}
        {content}
      </div>
    );
  }
}
