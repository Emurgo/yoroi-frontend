// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, IntlContext } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import Dialog from '../../widgets/Dialog';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat, $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { Typography } from '@mui/material';
import Select from '../../common/Select';
import { MenuItemStyled } from '../../common/commonStyles/MenuItemStyled';

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
  static contextType:any = IntlContext;
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      selectedNetwork: {
        label: this.context.formatMessage(messages.selectLabel),
        value: this.props.currentNetworkId,
      },
    },
  });

  render(): Node {
    const intl = this.context;
    const { onCancel, onApply, networks } = this.props;
    const baseComponentPath = 'switchNetworkDialog';

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        closeButton={<DialogCloseButton onClose={onCancel} />}
        id={baseComponentPath}
        styleOverride={{ maxWidth: '648px' }}
        dialogActions={[
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
        <Typography variant="body1" color="ds.text_gray_medium">
          {intl.formatMessage(messages.dialogText)}
        </Typography>
        <Select
          formControlProps={{ sx: { marginTop: '25px' } }}
          labelId={baseComponentPath}
          {...this.form.$('selectedNetwork').bind()}
          id={baseComponentPath + '-selectNetwork-dropdown'}
        >
          {networks.map(({ id, name }) => (
            <MenuItemStyled value={id} key={id} id={baseComponentPath + '-selectNetwork_' + id + '-menuItem'} isGray>
              {intl.formatMessage(name)}
            </MenuItemStyled>
          ))}
        </Select>
      </Dialog>
    );
  }
}
