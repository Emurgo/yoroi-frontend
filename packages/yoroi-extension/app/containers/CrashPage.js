// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import Crashed from '../components/loading/Crashed';
import { downloadLogs } from '../utils/logging';

@observer
export default class CrashPage extends Component<{||}> {

  render(): Node {
    return (
      <Crashed
        onDownloadLogs={downloadLogs}
      />
    );
  }
}
