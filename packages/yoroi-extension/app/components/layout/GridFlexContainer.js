// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { chunk } from 'lodash';

import HorizontalFlexContainer from './HorizontalFlexContainer';

type Props = {|
  +children: ?Node,
  +rowSize: number
|};

@observer
export default class GridFlexContainer extends Component<Props> {
  render(): Node {
    const { children, rowSize } = this.props;

    const childArray = React.Children.toArray(children);
    const chunkedChildren = chunk(childArray, rowSize);

    /* eslint-disable react/no-array-index-key */
    return (
      <div>
        {
          chunkedChildren.map((childChunk, i) => (
            <HorizontalFlexContainer key={i}>
              {childChunk}
            </HorizontalFlexContainer>
          ))
        }
      </div>
    );
    /* eslint-enable react/no-array-index-key */
  }
}
