// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import SupportPage from '../components/SupportPage';

type Props = {||};

@observer
export default class SupportContainer extends Component<Props> {
  render(): Node {
    return <SupportPage />;
  }
}
