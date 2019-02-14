// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';

import HorizontalFlexContainer from './HorizontalFlexContainer';

type Props = {
  children: ?Node,
  rowSize: Number
};

@observer
export default class GridFlexContainer extends Component<Props> {
  render() {
    const { children, rowSize } = this.props;

    const childArray = React.Children.toArray(children);
    const chunkedChildren = _.chunk(childArray, rowSize);

    /* eslint-disable react/no-array-index-key */
    return (
      <div>
        {
          chunkedChildren.map((chunk, i) => (
            <HorizontalFlexContainer key={i}>
              {chunk}
            </HorizontalFlexContainer>
          ))
        }
      </div>
    );
    /* eslint-enable react/no-array-index-key */
  }
}
