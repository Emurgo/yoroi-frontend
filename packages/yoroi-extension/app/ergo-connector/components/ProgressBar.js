// @flow
import type { Node } from 'react';
import styles from './ProgressBar.scss';
import LinearProgress from '@mui/material/LinearProgress';


type Props = {|
  +step?: number,
  +max?: number,
|};

const ProgressBar = ({ step, max }: Props): Node => {
  return (
    <div className={styles.component}>
      <LinearProgress color='secondary' sx={{ height: '8px' }} value={step * 100 / max} variant="determinate" />
    </div>
  );
};

export default ProgressBar;

ProgressBar.defaultProps = {
  step: 1,
  max: 3,
};
