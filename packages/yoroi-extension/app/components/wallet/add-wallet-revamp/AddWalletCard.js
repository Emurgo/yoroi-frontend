// @flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import styles from './AddWalletCard.scss';

type Props = {|
  label: string,
  imageSrc: string,
  onClick(): void,
|};

export default function AddWalletCard(props: Props): Node {
  const { label, imageSrc, onClick } = props;
  return (
    <button onClick={onClick} className={styles.component} type='button'>
      <Box>
        <img src={imageSrc} alt={label} />
      </Box>
      <Typography variant='h3' textAlign='center' padding='0px 40px' mt='16px'>{label}</Typography>
    </button>
  );
};
