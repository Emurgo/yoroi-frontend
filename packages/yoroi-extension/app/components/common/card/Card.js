// @flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import styles from './Card.scss';

type Props = {|
  label: string,
  description: string | Node,
  imageSrc: string,
  onClick?: () => void,
  children?: Node,
  style?: Object,
|};

export default function Card(props: Props): Node {
  const { label, description, imageSrc, onClick, style } = props;
  return (
    <button onClick={onClick} className={styles.component} style={style}>
      <Box>
        <img src={imageSrc} alt={label} />
      </Box>
      <Typography component="div"
        variant="h3"
        color="ds.gray_cmax"
        fontWeight={500}
        textAlign="center"
        padding="0px 40px"
        mt="16px"
        mb="4px"
      >
        {label}
      </Typography>
      <Typography component="div" variant="body2" color="ds.gray_c900" mb="16px">
        {description}
      </Typography>
      {props.children}
    </button>
  );
}
