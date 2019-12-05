// @flow

import React from 'react';
import type { InjectedContainerProps } from '../../../types/injectedPropsType';

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

const Staking = (props: {|
    ...InjectedContainerProps,
    stakingUrl: string,
|}) => {
  const iframeRef = React.useRef(null);
  const { stores, stakingUrl } = props;
  const { profile } = stores;

  useIframeMessageReceiver();

  if (stakingUrl == null) {
    throw new Error('Staking undefined SEIZA_FOR_YOROI_URL should never happen');
  }
  return (
      <iframe ref={iframeRef} title="Staking" src={`${stakingUrl}&locale=${profile.currentLocale}`} frameBorder="0" width="100%" height="100%" />
  );
};

export default Staking;
