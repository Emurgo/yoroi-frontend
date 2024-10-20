// @flow
import type { Node } from 'react';
import { Box, Typography, styled } from '@mui/material';
import styles from './Card.scss';

type Props = {|
  label: string,
  description: string | Node,
  imageSrc: string,
  onClick?: () => void,
  children?: Node,
  style?: Object,
|};

const CardWrapper = styled('button')(({ theme }) => ({
  background: theme.palette.ds.bg_gradient_1,
}));

export default function Card(props: Props): Node {
  const { label, description, imageSrc, onClick, style } = props;
  return (
    <CardWrapper onClick={onClick} className={styles.component} style={style}>
      <Box>
        <img src={imageSrc} alt={label} />
      </Box>
      <Typography
        component="div"
        variant="h3"
        color="grayscale.max"
        fontWeight={500}
        textAlign="center"
        padding="0px 40px"
        mt="16px"
        mb="4px"
      >
        {label}
      </Typography>
      <Typography component="div" variant="body2" color="grayscale.900" mb="16px">
        {description}
      </Typography>
      {props.children}
    </CardWrapper>
  );
}
