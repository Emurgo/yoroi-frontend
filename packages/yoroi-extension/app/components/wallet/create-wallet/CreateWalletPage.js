// @flow
import { useEffect, useState } from 'react';
import type { Node, ComponentType } from 'react';

import SaveRecoveryPhraseTipsDialog from './SaveRecoveryPhraseTipsDialog';
import { Box } from '@mui/material';
import { observer } from 'mobx-react';

type Props = {||}


function CreateWalletPage(): Node {
  const [open, setOpen] = useState(false);


  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <Box>
      <h1>Create new wallet!!</h1>
      <SaveRecoveryPhraseTipsDialog
        open={open}
        onClose={() => setOpen(false)}
      />
    </Box>
  );
}


export default (observer(CreateWalletPage) : ComponentType<Props> )