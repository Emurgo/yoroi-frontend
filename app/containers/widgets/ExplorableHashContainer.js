// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../utils/routing';

import ExplorableHash from '../../components/widgets/hashWrappers/ExplorableHash';

type Props = {|
  children: ?Node,
  hash: string,
  light: boolean,
|};

@observer
export default class ExplorableHashContainer extends Component<Props> {

  render() {
    const seizaAddress = 'https://seiza.com/blockchain/address/';
    return (
      <ExplorableHash
        explorerName="Seiza"
        url={seizaAddress + this.props.hash}
        light={this.props.light}
        onExternalLinkClick={handleExternalLinkClick}
      >
        {this.props.children}
      </ExplorableHash>
    );
  }

}
