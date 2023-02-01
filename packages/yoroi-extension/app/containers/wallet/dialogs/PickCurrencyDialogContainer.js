// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import PickCurrencyOptionDialog from '../../../components/wallet/add/option-dialog/PickCurrencyOptionDialog';

type Props = {|
  +onClose: void => void,
  +onCardano: void => void,
  +onCardanoTestnet: void => void,
  +onCardanoPreprodTestnet: void => void,
  +onCardanoPreviewTestnet: void => void,
  +onErgo: void | (void => void),
  +onAlonzoTestnet: void => void,
|};

@observer
export default class PickCurrencyDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <PickCurrencyOptionDialog
        onExternalLinkClick={handleExternalLinkClick}
        onCancel={this.props.onClose}
        onCardano={this.props.onCardano}
        onCardanoTestnet={this.props.onCardanoTestnet}
        onCardanoPreprodTestnet={this.props.onCardanoPreprodTestnet}
        onCardanoPreviewTestnet={this.props.onCardanoPreviewTestnet}
        onErgo={this.props.onErgo}
        onAlonzoTestnet={this.props.onAlonzoTestnet}
      />
    );
  }
}
