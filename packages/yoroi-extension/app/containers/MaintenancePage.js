// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import Maintenance from '../components/loading/Maintenance';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import { handleExternalLinkClick } from '../utils/routing';

@observer
export default class MaintenancePage extends Component<StoresAndActionsProps> {

  render(): Node {
    return (
      <Maintenance
        onExternalLinkClick={handleExternalLinkClick}
      />
    );
  }
}
