// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { isCardanoHaskell, isTestnet } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';

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
    if (isCardanoHaskell(network) && !isTestnet(network)) {
        return <a href={`https://cardanoscan.io/token/${address}`} rel="noreferrer" target='_blank'>{children}</a>
    }
    // Cardano testnet
    return <a href={`https://testnet.cardanoscan.io/token/${address}`} rel="noreferrer" target='_blank'>{children}</a>
  }
}
