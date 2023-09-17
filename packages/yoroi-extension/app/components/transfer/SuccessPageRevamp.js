// @flow

import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import DialogCloseButton from '../widgets/DialogCloseButton';
import LoadingSpinner from '../widgets/LoadingSpinner';
import { Box, Typography } from '@mui/material';
import { ReactComponent as SuccessImg } from '../../assets/images/transfer-success.inline.svg';
import DialogRevamp from '../widgets/DialogRevamp';

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
              label: this.props.closeInfo.closeLabel,
              onClick: this.props.closeInfo.onClose,
              primary: true,
            },
          ];

    return (
      <DialogRevamp
        title={title}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={closeInfo ? closeInfo.onClose : undefined}
        closeButton={
          closeInfo ? <DialogCloseButton onClose={closeInfo.onClose} revamp /> : undefined
        }
      >
        <Box maxWidth="600px" outline="10px solid green">
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
          <Typography variant="body2" color="gray.900" textAlign="left" mt="4px" mb="24px">
            {text}
          </Typography>
          {this.props.closeInfo == null && <LoadingSpinner />}
        </Box>
      </DialogRevamp>
    );
  }
}
