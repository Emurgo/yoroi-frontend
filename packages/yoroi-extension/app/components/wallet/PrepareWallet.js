// @flow
import type { Node } from 'react';
import { useLottie } from 'lottie-react';
import prepareWalletAnimation from '../../assets/animations/prepare-wallet.json';

export function PrepareWallet(): Node {
  const options = {
    animationData: prepareWalletAnimation,
    loop: true,
  };
  const { View } = useLottie(options);

  return <>{View}</>;
}
