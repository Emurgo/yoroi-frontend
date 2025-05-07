// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, IntlContext, FormattedMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import Dialog from '../../widgets/Dialog';
import CodeBlock from '../../widgets/CodeBlock';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import QrCodeWrapper from '../../widgets/QrCodeWrapper';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { toDerivationPathString } from '../../../api/ada/lib/cardanoCrypto/keys/path';
import { Box, List, ListItem, Typography, styled } from '@mui/material';
import { strong } from '../../../i18n/htmlEmbeddedMessageHelper';

export const messages: * = defineMessages({
  publicKeyExplanationLine1: {
    id: 'wallet.settings.publicExport.explanationLine1',
    defaultMessage: `!!!The below you can find your wallet's <strong>public</strong> key information.`,
  },
  reason1: {
    id: 'wallet.settings.publicExport.reason1',
    defaultMessage: '!!!Open your wallet in read-only mode in Yoroi Mobile to easily check your balance at any time',
  },
  reason2: {
    id: 'wallet.settings.publicExport.reason2',
    defaultMessage: '!!!Share your key with tax software to automatically generate tax reports',
  },
});

type Props = {|
  +onClose: void => void,
  +publicKeyHex: string,
  +pathToPublic: Array<number>,
|};

const SListItem = styled(ListItem)(({ theme }) => ({
  paddingLeft: '8px',
  paddingBottom: '0px',
  '::before': {
    content: '"●"',
    marginRight: '0.4em',
    fontSize: '0.8em',
    color: theme.palette.ds.text_gray_medium,
  },
}));

@observer
export default class ExportPublicKeyDialog extends Component<Props> {
  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;

    const walletInfo = {
      publicKeyHex: this.props.publicKeyHex,
      path: this.props.pathToPublic,
    };

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.exportButtonLabel)}
        closeOnOverlayClick={false}
        onClose={this.props.onClose}
        closeButton={<DialogCloseButton />}
        className="ExportWalletDialogContainer"
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Box marginBottom="20px">
            <Typography variant="body1" mb="16px" color="ds.text_gray_medium">
              <FormattedMessage {...messages.publicKeyExplanationLine1} values={{ strong }}/>
            </Typography>
            <Typography variant="body1" mb="16px" color="ds.text_gray_medium">
              <FormattedMessage {...globalMessages.publicKeyExplanation} />
            </Typography>
            <Typography variant="body1" color="ds.text_gray_medium">
              {intl.formatMessage(globalMessages.whyUse)}
            </Typography>
            <List disablePadding>
              <SListItem key="1">
                <Typography color="ds.text_gray_medium" mb="0px">
                  {intl.formatMessage(messages.reason1)}
                </Typography>
              </SListItem>
              <SListItem key="2">
                <Typography color="ds.text_gray_medium" mb="0px">
                  {intl.formatMessage(messages.reason2)}
                </Typography>
              </SListItem>
            </List>
          </Box>
          {this.renderQrCode(walletInfo)}
          {this.renderKey(walletInfo.publicKeyHex)}
          {this.renderPath(walletInfo.path)}
        </Box>
      </Dialog>
    );
  }

  renderQrCode: ({|
    publicKeyHex: string,
    path: Array<number>,
  |}) => Node = walletInfo => {
    return (
      <>
        <Box display="flex" justifyContent="center" marginBottom="16px">
          <Box
            padding="16px"
            width="184px"
            height="184px"
            borderRadius="8px"
            sx={{
              backgroundColor: 'ds.white_static',
            }}
          >
            <QrCodeWrapper value={JSON.stringify(walletInfo)} size={152} />
          </Box>
        </Box>
      </>
    );
  };

  renderKey: string => Node = key => {
    const intl = this.context;
    return (
      <>
        <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
          {intl.formatMessage(globalMessages.keyLabel)}
        </Typography>
        <CodeBlock code={key} />
        <br />
      </>
    );
  };

  renderPath: (Array<number>) => Node = addressing => {
    const intl = this.context;
    return (
      <>
        <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
          {intl.formatMessage(globalMessages.derivationPathLabel)}
        </Typography>
        <Box fontFamily="RobotoMono">
          <Typography variant="body1" color="ds.text_gray_low">
            {toDerivationPathString(addressing)}
          </Typography>
        </Box>
        <br />
      </>
    );
  };
}
