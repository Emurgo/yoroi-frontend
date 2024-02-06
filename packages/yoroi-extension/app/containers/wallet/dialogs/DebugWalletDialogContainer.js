// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import DebugWalletDialog from '../../../components/wallet/warning-dialogs/DebugWalletDialog';
import { handleExternalLinkClick } from '../../../utils/routing';

type Props = {|
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
}

export function createDebugWalletDialog(
  checksumTextPart: string,
  onClose: void => void,
): (void => Node) {
  return (() => <DebugWalletDialogContainer
    checksumTextPart={checksumTextPart}
    onClose={onClose}
  />);
}
