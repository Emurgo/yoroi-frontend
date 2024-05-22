// @flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import styles from './AddWalletCard.scss';

type Props = {|
  label: string,
  imageSrc: string,
  onClick(): void,
  id: string,
|};

export default function AddWalletCard(props: Props): Node {
  const { label, imageSrc, onClick, id } = props;
  return (
    <button onClick={onClick} className={styles.component} id={id} type="button">
      <Box>
        <img src={imageSrc} alt={label} />
      </Box>
      <Typography component="div" variant="h3" fontWeight={500} textAlign="center" padding="0px 40px" mt="16px">
        {label}
      </Typography>
    </button>
  );
}
