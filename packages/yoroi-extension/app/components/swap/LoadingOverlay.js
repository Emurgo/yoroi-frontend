// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { alpha, Box, Button, Modal, Typography } from '@mui/material';
import Dialog, { ModalContainer } from '../widgets/Dialog';
import CheckboxLabel from '../common/CheckboxLabel';
import { map } from 'lodash';
import classnames from 'classnames';
import { LoadingButton } from '@mui/lab';
import LoadingSpinner from '../widgets/LoadingSpinner';

type Props = {|
|};

export default function LoadingOverlay({}: Props): Node {
  return (
    <Modal open onClose={() => {}}
      sx={{
        bgcolor: alpha('#121F4D', 0.7),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      id="loadingOverlay"
    >
      <ModalContainer
        empty
        display="flex"
        flexDirection="column"
        className='loadingOverlay'
        boxShadow="0px 13px 20px -1px #00000026"
      >
        <LoadingSpinner large light />
      </ModalContainer>
    </Modal>
  );
}
