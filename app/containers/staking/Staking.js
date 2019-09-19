// @flow

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import MainLayout from '../MainLayout';
import TopBarContainer from '../TopBarContainer';
import type { InjectedContainerProps } from '../../types/injectedPropsType';

const prettifyReceivedPools = (pools: Array<{
  name: string,
  poolHash: string,
}>) => {
  return pools.map(({ name, poolHash }) => `${name}\n${poolHash}\n`)
    .join('\n');
};

const messageHandler = (event) => {
  if (event.origin !== process.env.SEIZA_FOR_YOROI_URL) return;
  console.log('Received message from Seiza:', event.data);

  // eslint-disable-next-line no-alert
  alert('You have selected following pools:\n' + prettifyReceivedPools(event.data));
};

const useIframeMessageReceiver = () => {
  React.useEffect(() => {
    window.addEventListener('message', messageHandler, false);

    return () => {
      window.removeEventListener('message', messageHandler);
    };

  }, []);
};

@observer
export default class Staking extends Component<InjectedContainerProps> {

  render() {
    const iframeRef = React.useRef(null);
    const { actions, stores, children } = this.props;
    const { profile } = stores;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);

    useIframeMessageReceiver();

    const seizaUrl = process.env.SEIZA_FOR_YOROI_URL;
    if (seizaUrl == null) {
      throw new Error('Staking undefined SEIZA_FOR_YOROI_URL should never happen');
    }
    return (
      <MainLayout
        topbar={topbarContainer}
        // TODO: Check Seiza server connection
        connectionErrorType="healthy"
        classicTheme={profile.isClassicTheme}
        actions={actions}
        stores={stores}
      >
        <iframe ref={iframeRef} title="Staking" src={`${seizaUrl}/staking?locale=${profile.currentLocale}`} frameBorder="0" width="100%" height="100%" />;
        {children}
      </MainLayout>
    );
  }
}
