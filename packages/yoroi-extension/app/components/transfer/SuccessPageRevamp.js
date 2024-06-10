// @flow

import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import DialogCloseButton from '../widgets/Dialog/DialogCloseButton';
import LoadingSpinner from '../widgets/LoadingSpinner';
import { Box, Typography } from '@mui/material';
import { ReactComponent as SuccessImg } from '../../assets/images/transfer-success.inline.svg';
import Dialog from '../widgets/Dialog/Dialog';

type Props = {|
  +title: string,
  +text: string,
  +closeInfo?: {|
    +onClose: void => PossiblyAsync<void>,
    +closeLabel: string,
  |},
|};

@observer
export class SuccessPageRevamp extends Component<Props> {
  static defaultProps: {| closeInfo: void |} = {
    closeInfo: undefined,
  };

  render(): Node {
    const { title, closeInfo, text } = this.props;
    const actions =
      closeInfo == null
        ? undefined
        : [
            {
              label: closeInfo.closeLabel,
              onClick: closeInfo.onClose,
              primary: true,
            },
          ];

    return (
      <Dialog
        title={title}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={closeInfo ? closeInfo.onClose : undefined}
        closeButton={
          closeInfo ? <DialogCloseButton onClose={closeInfo.onClose} isRevampLayout /> : undefined
        }
      >
        <Box maxWidth="600px">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: '16px',
            }}
          >
            <SuccessImg />
          </Box>
          <Typography component="div" variant="body1" color="ds.gray_c900" textAlign="left" mt="4px">
            {text}
          </Typography>
          {this.props.closeInfo == null && <LoadingSpinner />}
        </Box>
      </Dialog>
    );
  }
}
