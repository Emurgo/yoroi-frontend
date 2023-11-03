// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import DebugWalletDialog from '../../../components/wallet/warning-dialogs/DebugWalletDialog';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { handleExternalLinkClick } from '../../../utils/routing';

export type GeneratedData = typeof DebugWalletDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  checksumTextPart: string,
  onClose: void => void,
|};

@observer
export default class DebugWalletDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <DebugWalletDialog
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
      throw new Error(`${nameof(DebugWalletDialogContainer)} no way to generated props`);
    }
    return Object.freeze({
    });
  }
}

export function createDebugWalletDialog(
  checksumTextPart: string,
  onClose: void => void,
  props: InjectedOrGenerated<GeneratedData>,
): (void => Node) {
  return (function() {
    return <DebugWalletDialogContainer
      {...props}
      checksumTextPart={checksumTextPart}
      onClose={onClose}
    />;
  });
}
