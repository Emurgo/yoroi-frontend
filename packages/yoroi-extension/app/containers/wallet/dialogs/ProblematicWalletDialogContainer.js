// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import ProblematicWalletDialog from '../../../components/wallet/warning-dialogs/ProblematicWalletDialog';
import { handleExternalLinkClick } from '../../../utils/routing';

type Props = {|
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
}

export function createProblematicWalletDialog(
  checksumTextPart: string,
  onClose: void => void,
): (void => Node) {
  return (() => <ProblematicWalletDialogContainer
    checksumTextPart={checksumTextPart}
    onClose={onClose}
  />);
}
