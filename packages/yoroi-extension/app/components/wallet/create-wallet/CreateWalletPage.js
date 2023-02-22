// @flow
import { useEffect } from 'react';
import type { Node, ComponentType } from 'react';

import SaveRecoveryPhraseTipsDialog from './SaveRecoveryPhraseTipsDialog';
import { Box } from '@mui/material';
import { observer } from 'mobx-react';

type Props = {|
  openDialog(dialog: Node): void,
  isDialogOpen(dialog: Node): boolean,
  closeDialog(): void,
|}


function CreateWalletPage(props: Props): Node {
  const { openDialog, isDialogOpen, closeDialog } = props;

  const isOpen = isDialogOpen(SaveRecoveryPhraseTipsDialog);

  useEffect(() => {
    if (isDialogOpen(SaveRecoveryPhraseTipsDialog)) return;
    openDialog(SaveRecoveryPhraseTipsDialog)

    return () => {
      closeDialog(SaveRecoveryPhraseTipsDialog)
    }
  }, [isOpen]);

  return (
    <Box>
      <h1>Create new wallet!!</h1>
      <SaveRecoveryPhraseTipsDialog
        open={isOpen}
        onClose={() => closeDialog(SaveRecoveryPhraseTipsDialog)}
      />
    </Box>
  );
}


export default (observer(CreateWalletPage) : ComponentType<Props> )