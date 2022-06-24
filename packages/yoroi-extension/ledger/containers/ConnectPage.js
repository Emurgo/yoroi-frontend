// @flow //
import React from 'react';
import { observer } from 'mobx-react';

import type { InjectedContainerProps } from '../types/injected-props';
import { ENV } from '../const';
import Layout from '../components/Layout';
import ConnectBlock from '../components/connect/ConnectBlock';

type Props = InjectedContainerProps

@observer
export default class ConnectPage extends React.Component<Props> {
  render() {
    const {
      connectStore,
      profileStore
    } = this.props.rootStore;

    const {
      isTransportWebAuthn,
      transportId,
      progressState,
      currentOperationName,
      executeAction,
      deviceCode,
      signTxInfo,
      verifyAddressInfo,
      deriveAddressInfo,
      wasDeviceLocked,
      setTransport,
      setDeviceCode,
      response,
      deviceVersion,
    } = connectStore;

    const {
      appVersion,
      setLocale,
      currentLocale,
    } = profileStore;

    return (
      <Layout
        setTransport={setTransport}
        setLocale={setLocale}
        isDevelopment={ENV.isDevelopment}
        appVersion={appVersion}
        transportId={transportId}
        currentLocale={currentLocale}
      >
        <ConnectBlock
          isWebAuthn={isTransportWebAuthn}
          isFirefox={ENV.isFirefox}
          progressState={progressState}
          currentOperationName={currentOperationName}
          executeAction={executeAction}
          deviceCode={deviceCode}
          setDeviceCode={setDeviceCode}
          signTxInfo={signTxInfo}
          verifyAddressInfo={verifyAddressInfo}
          deriveAddressInfo={deriveAddressInfo}
          wasDeviceLocked={wasDeviceLocked}
          response={response}
          deviceVersion={deviceVersion}
        />
      </Layout>
    );
  }
}
