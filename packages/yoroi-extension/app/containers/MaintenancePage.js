// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import Maintenance from '../components/loading/Maintenance';
import { handleExternalLinkClick } from '../utils/routing';
import type { StoresProps } from '../stores';

@observer
export default class MaintenancePage extends Component<StoresProps> {

  render(): Node {
    return (
      <Maintenance
        onExternalLinkClick={handleExternalLinkClick}
      />
    );
  }
}
