// @flow //
import React from 'react';
import { observer } from 'mobx-react';

import type {
  ShowAddressRequestWrapper,
  MessageType,
} from '../../types/cmn';
import type {
  DeviceCodeType,
  ProgressStateType,
  OperationNameType,
} from '../../types/enum';
import { PROGRESS_STATE } from '../../types/enum';
import type {
  executeActionFunc,
  setDeviceCodeFunc,
} from '../../types/func';
import LoadingSpinner from '../widgets/LoadingSpinner';
import WebAuthnTopBlock from './webauthn-top/WebAuthnTopBlock';
import TitleBlock from './title/TitleBlock';
import DeviceSelectionBlock from './device-selection/DeviceSelectionBlock';
import OperationBlock from './operation/OperationBlock';
import ResponseBlock from './response/ResponseBlock';
import type {
  DeriveAddressRequest,
  SignTransactionRequest,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import styles from './ConnectBlock.scss';

type Props = {|
  isWebAuthn: boolean,
  isFirefox: boolean,
  progressState: ProgressStateType,
  currentOperationName: OperationNameType,
  executeAction: executeActionFunc,
  deviceCode: DeviceCodeType,
  setDeviceCode: setDeviceCodeFunc,
  signTxInfo: SignTransactionRequest,
  verifyAddressInfo: ShowAddressRequestWrapper,
  deriveAddressInfo: DeriveAddressRequest,
  wasDeviceLocked: boolean,
  response: MessageType | void,
  deviceVersion: ?string,
|};

@observer
export default class ConnectBlock extends React.Component<Props> {
  // Yoroi styled loading spinner
  loadingSpinner: ?LoadingSpinner;

  render() {
    const {
      isWebAuthn,
      isFirefox,
      progressState,
      currentOperationName,
      executeAction,
      setDeviceCode,
      deviceCode,
      signTxInfo,
      verifyAddressInfo,
      deriveAddressInfo,
      wasDeviceLocked,
      response,
      deviceVersion,
    } = this.props;

    let content;
    let showWebAuthnTop: boolean = false;

    switch (progressState) {
      case PROGRESS_STATE.LOADING:
        content = (
          <LoadingSpinner
            ref={(component) => { this.loadingSpinner = component; }}
            showText
          />
        );
        break;
      case PROGRESS_STATE.DEVICE_TYPE_SELECTION:
        content = (
          <DeviceSelectionBlock
            currentOperationName={currentOperationName}
            knownDeviceCode={deviceCode}
            setDeviceCode={setDeviceCode}
            executeAction={executeAction}
          />
        );
        break;
      case PROGRESS_STATE.DEVICE_RESPONSE:
        if (response == null) throw new Error(`Missing response`);
        content = (
          <ResponseBlock
            response={response}
          />
        );
        break;
      default:
        showWebAuthnTop = isWebAuthn;
        content = (
          <OperationBlock
            deviceCode={deviceCode}
            currentOperationName={currentOperationName}
            progressState={progressState}
            signTxInfo={signTxInfo}
            verifyAddressInfo={verifyAddressInfo}
            deriveAddressInfo={deriveAddressInfo}
            wasDeviceLocked={wasDeviceLocked}
            deviceVersion={deviceVersion}
          />
        );
    }

    return (
      <div className={styles.component}>
        <WebAuthnTopBlock
          showWebAuthnTop={showWebAuthnTop}
          isFirefox={isFirefox}
        />
        <TitleBlock currentOperationName={currentOperationName} />
        {content}
      </div>
    );
  }
}
