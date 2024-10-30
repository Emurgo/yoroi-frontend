// @flow
import type { Node } from 'react';
import { Box, Typography, styled } from '@mui/material';
import styles from './AddWalletCard.scss';

const GradientBox = styled(Box)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_1,
}));

type Props = {|
  label: string,
  imageSrc: string,
  onClick(): void,
  id: string,
|};

export default function AddWalletCard(props: Props): Node {
  const { label, imageSrc, onClick, id } = props;
  return (
    <GradientBox>
      <button onClick={onClick} className={styles.component} id={id} type="button">
        <Box>
          <img src={imageSrc} alt={label} />
        </Box>
        <Typography color="ds.el_gray_max" variant="h3" fontWeight={500} textAlign="center" padding="0px 40px" mt="16px">
          {label}
        </Typography>
      </button>
    </GradientBox>
  );
}
