// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import AboutPage from '../components/AboutPage';

type Props = {||};

@observer
export default class AboutContainer extends Component<Props> {
  render(): Node {
    return <AboutPage />;
  }
}
