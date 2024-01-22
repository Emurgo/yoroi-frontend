// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import PickCurrencyOptionDialog from '../../../components/wallet/add/option-dialog/PickCurrencyOptionDialog';

type Props = {|
  +onClose: void => void,
  +onCardano: void => void,
  +onCardanoPreprodTestnet: void => void,
  +onCardanoPreviewTestnet: void => void,
  +onCardanoSanchoTestnet: void => void,
|};

@observer
export default class PickCurrencyDialogContainer extends Component<Props> {

  render(): Node {
    return (
      <PickCurrencyOptionDialog
        onExternalLinkClick={handleExternalLinkClick}
        onCancel={this.props.onClose}
        onCardano={this.props.onCardano}
        onCardanoPreprodTestnet={this.props.onCardanoPreprodTestnet}
        onCardanoPreviewTestnet={this.props.onCardanoPreviewTestnet}
        onCardanoSanchoTestnet={this.props.onCardanoSanchoTestnet}
      />
    );
  }
}
