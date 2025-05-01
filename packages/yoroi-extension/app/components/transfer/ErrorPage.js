// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, Typography } from '@mui/material';

type Props = {|
  +error?: ?LocalizableError,
  +onCancel: void => void,
  +title: string,
  +backButtonLabel: string,
|};

@observer
export default class ErrorPage extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;
    const { error, onCancel, title, backButtonLabel } = this.props;

    const actions = [
      {
        label: backButtonLabel,
        onClick: onCancel,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.errorLabel)}
        dialogActions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onCancel}
        styleFlags={{
          contentNoTopPadding: true,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '600px',
            '& .ModalContent': {
              paddingTop: 0,
            },
          }}
        >
          <Box
            component="div"
            sx={{
              color: 'ds.text_gray_medium',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }} color="ds.text_gray_medium">
              {title}
            </Typography>
            {error && (
              <Typography variant="body2" color="ds.text_error" paddingTop="16px">
                {intl.formatMessage(error, error.values)}
              </Typography>
            )}
          </Box>
        </Box>
      </Dialog>
    );
  }
}
