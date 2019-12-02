// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import SeizaFetcher from './SeizaFetcher';

import type { InjectedProps } from '../../../types/injectedPropsType';
import type {ConfigType} from '../../../../config/config-types';

type Props = InjectedProps

declare var CONFIG: ConfigType;
const seizaAdvance = CONFIG.seiza.advance;

@observer
export default class StakingAdvancePage extends Component<Props> {

  render() {
    const { stores } = this.props;
    return (<SeizaFetcher {...this.props} stores={stores} stakingUrl={seizaAdvance} />);
  }
}
