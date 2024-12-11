// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import Dialog from '../../widgets/Dialog';
import { isValidWalletPassword, isValidRepeatPassword } from '../../../utils/validations';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat, $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { MenuItem, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Select from '../../common/Select';

const messages = defineMessages({
  dialogTitle: {
    id: 'settings.general.switchNetwork.dialog.title',
    defaultMessage: '!!!Switch network',
  },
  dialogText: {
    id: 'settings.general.switchNetwork.dialog.text',
    defaultMessage: '!!!The Cardano network is a technical infrastructure combining Cardano nodes and their interactions in one unified system. It consists of a collection of nodes that communicate with each other to maintain the distributed ledger.',
  },
  applyButton: {
    id: 'settings.general.switchNetwork.dialog.button.apply',
    defaultMessage: '!!!apply',
  },
  selectLabel: {
    id: 'settings.general.switchNetwork.dialog.label.select',
    defaultMessage: '!!!Select Network',
  },
});

const DialogText = styled(Box)(() => ({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '24px',
}));

type Props = {|
  +onCancel: void => void,
  +networks: Array<{|
    id: number,
    name: $npm$ReactIntl$MessageDescriptor,
  |}>,
  +onApply: (number) => Promise<void>,
  +currentNetworkId: number,
|};

@observer
export default class Switch extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      selectedNetwork: {
        label: this.context.intl.formatMessage(messages.selectLabel),
        value: this.props.currentNetworkId,
      },
    },
  });

  render(): Node {
    const { intl } = this.context;
    const { onCancel, onApply, networks } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        closeButton={<DialogCloseButton onClose={onCancel} />}
        id="switchNetworkDialog"
        actions={[
          {
            label: intl.formatMessage(globalMessages.cancel),
            onClick: onCancel,
            primary: false,
          },
          {
            label: intl.formatMessage(messages.applyButton),
            onClick: () => onApply(this.form.$('selectedNetwork').value),
            primary: true,
          },
        ]}          
      >
        <DialogText>
          {intl.formatMessage(messages.dialogText)}
        </DialogText>
        <Select
          formControlProps={{ sx: { marginTop: '25px' } }}
          labelId="network-select"
          {...this.form.$('selectedNetwork').bind()}
        >
          {networks.map(({ id, name }) => (
            <MenuItem value={id} key={id}>
              {intl.formatMessage(name)}
            </MenuItem>
          ))}
        </Select>
      </Dialog>
    );
  }
}
