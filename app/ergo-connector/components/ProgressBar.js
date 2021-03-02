// @flow
import * as React from 'react';
import styles from './ProgressBar.scss';

import type { Node } from 'react';

type Props = {|
  +step?: number,
  +max?: number,
|};

const ProgressBar = ({ step, max }: Props): Node => {
  return (
    <div className={styles.component}>
      <progress value={step} max={max} />
    </div>
  );
};

export default ProgressBar;

ProgressBar.defaultProps = {
  step: 1,
  max: 3,
};
