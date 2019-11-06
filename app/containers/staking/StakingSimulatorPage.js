// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import type { InjectedProps } from '../../types/injectedPropsType';

type Props = InjectedProps;

@observer
export default class StakingSimulatorPage extends Component<Props> {

  render() {
    return (<div>StakingSimulatorPage</div>);
  }
}
