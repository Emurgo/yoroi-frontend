// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import { Box, Button, Typography } from '@mui/material';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';

export const messages: * = defineMessages({
  titleLabel: {
    id: 'wallet.settings.export.label',
    defaultMessage: '!!!Export wallet',
  },
  exportExplanation: {
    id: 'wallet.settings.export.explanation',
    defaultMessage: '!!!This can be used to transfer a wallet between devices.',
  },
});

type Props = {|
  +openDialog: void => void,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class ExportWallet extends Component<Props & InjectedProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { isRevampLayout, openDialog } = this.props;

    return (
      <Box
        sx={{
          pb: '20px',
          mt: isRevampLayout ? '20px' : '32px',
          pt: !isRevampLayout && '30px',
          borderTop: !isRevampLayout && '1px solid',
          borderColor: !isRevampLayout && 'var(--yoroi-palette-gray-200)',
        }}
      >
        <Typography component="div"
          variant={isRevampLayout ? 'body1' : 'h5'}
          fontWeight={500}
          mb={isRevampLayout ? '16px' : '12px'}
          color="ds.gray_c900"
        >
          {intl.formatMessage(messages.titleLabel)}
        </Typography>

        <Typography component="div"
          variant={isRevampLayout ? 'body1' : 'body2'}
          color="ds.black_static"
          mb={isRevampLayout ? '16px' : '12px'}
        >
          {intl.formatMessage(messages.exportExplanation)}
        </Typography>

        <Button
          variant={isRevampLayout ? 'contained' : 'primary'}
          size={isRevampLayout ? 'flat' : 'medium'}
          className="exportWallet"
          onClick={openDialog}
          sx={{
            marginTop: !isRevampLayout && '20px',
            width: isRevampLayout ? 'fit-content' : '400px',
          }}
          id="settings:wallet-exportWallet-button"
        >
          {`${this.context.intl.formatMessage(globalMessages.exportButtonLabel)}`}
        </Button>
      </Box>
    );
  }
}

export default (withLayout(ExportWallet): ComponentType<Props>);
