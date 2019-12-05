// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import SeizaFetcher from './SeizaFetcher';

import type { InjectedProps } from '../../../types/injectedPropsType';
import type {ConfigType} from '../../../../config/config-types';

type Props = InjectedProps;

declare var CONFIG: ConfigType;
const seizaSimple = CONFIG.seiza.simple;

@observer
export default class StakingSimplePage extends Component<Props> {

  render() {
    const { stores } = this.props;
    return (<SeizaFetcher {...this.props} stores={stores} stakingUrl={seizaSimple} />);
  }
}
