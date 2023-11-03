// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import ProblematicWalletDialog from '../../../components/wallet/warning-dialogs/ProblematicWalletDialog';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { handleExternalLinkClick } from '../../../utils/routing';

export type GeneratedData = typeof ProblematicWalletDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  checksumTextPart: string,
  onClose: void => void,
|};

@observer
export default class ProblematicWalletDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <ProblematicWalletDialog
        onClose={this.props.onClose}
        onExternalLinkClick={handleExternalLinkClick}
        checksumTextPart={this.props.checksumTextPart}
      />
    );
  }

  // <TODO:CHECK_LINT>
  // eslint-disable-next-line react/no-unused-class-component-methods
  @computed get generated(): {||} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ProblematicWalletDialogContainer)} no way to generated props`);
    }
    return Object.freeze({
    });
  }
}

export function createProblematicWalletDialog(
  checksumTextPart: string,
  onClose: void => void,
  props: InjectedOrGenerated<GeneratedData>,
): (void => Node) {
  return (function() {
    return <ProblematicWalletDialogContainer
      {...props}
      checksumTextPart={checksumTextPart}
      onClose={onClose}
    />;
  });
}
