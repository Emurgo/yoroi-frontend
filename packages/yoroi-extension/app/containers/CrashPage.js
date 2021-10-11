// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import Crashed from '../components/loading/Crashed';
import type { JointInjectedOrGenerated } from '../types/injectedPropsType';
import { handleExternalLinkClick } from '../utils/routing';
import { downloadLogs } from '../utils/logging';

type GeneratedData = typeof CrashPage.prototype.generated;

@observer
export default class CrashPage extends Component<
  JointInjectedOrGenerated<GeneratedData>
> {

  render(): Node {
    return (
      <Crashed
        onExternalLinkClick={this.generated.handleExternalLinkClick}
        onDownloadLogs={downloadLogs}
      />
    );
  }

  @computed get generated(): {|handleExternalLinkClick: (event: MouseEvent) => void|} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(CrashPage)} no way to generated props`);
    }
    return Object.freeze({
      handleExternalLinkClick,
    });
  }
}
