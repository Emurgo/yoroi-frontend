import Dialog from '../../../../components/widgets/Dialog';
import { useIntl, defineMessages } from 'react-intl';
import { Typography } from '@mui/material';
import { useState } from 'react';
import globalMessages from '../../../../i18n/global-messages';

export default function Redeem(
  props: { address: string; onClose: () => void }
) {
  return (
    <Dialog
      withCloseButton
      onClose={props.onClose}
      title={'claim'}
    >
      Claim Dialog
    </Dialog>
  );
}
