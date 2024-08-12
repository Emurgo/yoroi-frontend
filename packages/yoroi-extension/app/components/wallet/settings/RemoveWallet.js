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
    id: 'wallet.settings.remove.label',
    defaultMessage: '!!!Remove wallet',
  },
  removeExplanation: {
    id: 'wallet.settings.remove.explanation',
    defaultMessage:
      '!!!Removing a wallet does not affect the wallet balance. Your wallet can be restored again at any time.',
  },
});

type Props = {|
  +walletName: string,
  +openDialog: void => void,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class RemoveWallet extends Component<Props & InjectedProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { openDialog, isRevampLayout } = this.props;

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
          color="ds.text_gray_normal"
          mb={isRevampLayout ? '16px' : '12px'}
        >
          {intl.formatMessage(messages.removeExplanation)}
        </Typography>

        <Button
          variant={isRevampLayout ? 'contained' : 'danger'}
          size={isRevampLayout ? 'flat' : 'medium'}
          color="error"
          className="removeWallet"
          onClick={openDialog}
          sx={{
            marginTop: !isRevampLayout && '20px',
            width: isRevampLayout ? 'fit-content' : '400px',
          }}
          id="settings:wallet-removeWallet-button"
        >
          {`${this.context.intl.formatMessage(globalMessages.remove)} ${this.props.walletName}`}
        </Button>
      </Box>
    );
  }
}

export default (withLayout(RemoveWallet): ComponentType<Props>);
