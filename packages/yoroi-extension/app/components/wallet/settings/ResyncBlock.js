// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { Box, Button, Typography } from '@mui/material';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { withLayout } from '../../../styles/context/layout';

export const messages: * = defineMessages({
  titleLabel: {
    id: 'wallet.settings.resync.label',
    defaultMessage: '!!!Resync wallet with the blockchain',
  },
  resyncExplanation: {
    id: 'wallet.settings.resync.explanation',
    defaultMessage:
      '!!!If you are experiencing issues with your wallet, or think you have an incorrect balance or transaction history, you can delete the local data stored by Yoroi and resync with the blockchain.',
  },
});

type Props = {|
  openDialog: void => void,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class ResyncBlock extends Component<Props & InjectedProps> {
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
          mt: isRevampLayout ? '40px' : '32px',
          pt: !isRevampLayout && '30px',
          borderTop: !isRevampLayout && '1px solid var(--yoroi-palette-gray-200)',
        }}
      >
        <Typography
          variant={isRevampLayout ? 'body1' : 'h5'}
          fontWeight={500}
          mb={isRevampLayout ? '16px' : '12px'}
          color="grayscale.900"
        >
          {intl.formatMessage(messages.titleLabel)}
        </Typography>
        <Typography
          variant={isRevampLayout ? 'body1' : 'body2'}
          color="common.black"
          mb={isRevampLayout ? '16px' : '12px'}
        >
          {intl.formatMessage(messages.resyncExplanation)}
        </Typography>

        <Button
          variant={isRevampLayout ? 'contained' : 'primary'}
          size={isRevampLayout ? 'flat' : 'medium'}
          className="resyncButton"
          onClick={openDialog}
          sx={{
            marginTop: !isRevampLayout && '20px',
            width: isRevampLayout ? 'fit-content' : '400px',
          }}
          id="settings:wallet-resyncWallet-button"
        >
          {this.context.intl.formatMessage(globalMessages.resyncButtonLabel)}
        </Button>
      </Box>
    );
  }
}

export default (withLayout(ResyncBlock): ComponentType<Props>);
