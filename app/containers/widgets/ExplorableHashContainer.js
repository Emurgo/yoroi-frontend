// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../utils/routing';

import ExplorableHash from '../../components/widgets/hashWrappers/ExplorableHash';

type Props = {
  children: ?Node,
};

@observer
export default class ExplorableHashContainer extends Component<Props> {

  render() {
    return (
      <ExplorableHash
        explorerName={"Seiza"}
        url={"https://seiza.com"}
        onExternalLinkClick={handleExternalLinkClick}
      >
        {this.props.children}
      </ExplorableHash>
    );
  }

}
