// // @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import SignTxPage from '../components/signin/SignTxPage';

@observer
export default class SignTxContainer extends Component<any> {
  render(): Node {
    return <SignTxPage />;
  }
}
