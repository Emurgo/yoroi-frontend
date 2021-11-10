// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { isCardanoHaskell, isErgo, isTestnet } from '../../api/ada/lib/storage/database/prepackaged/networks';

type Props = {|
  +children?: Node,
  +network: $ReadOnly<NetworkRow>,
  +address: string,
|};

@observer
export default class OpenInExplorer extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  render(): Node {
    const { children, network, address } = this.props;
    if (isErgo(network)) {
        return <a href={`https://explorer.ergoplatform.com/en/addresses/${address}`} rel="noreferrer" target='_blank'>{children}</a>
    }
    if (isCardanoHaskell(network) && !isTestnet(network)) {
        return <a href={`https://cardanoscan.io/${address}`} rel="noreferrer" target='_blank'>{children}</a>
    }
    // Cardano testnet
    return <a href={`https://testnet.cardanoscan.io/${address}`} rel="noreferrer" target='_blank'>{children}</a>
  }
}
