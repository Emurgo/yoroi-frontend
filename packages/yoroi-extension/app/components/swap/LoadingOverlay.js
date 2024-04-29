// @flow
import type { Node } from 'react';
import { alpha, Modal } from '@mui/material';
import { ModalContainer } from '../widgets/Dialog/Dialog';
import LoadingSpinner from '../widgets/LoadingSpinner';

type Props = {|
|};

export default function LoadingOverlay(_: Props): Node {
  return (
    <Modal
      open
      onClose={() => {}}
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
