// @flow //
import React from 'react';
import { observer } from 'mobx-react';
import styles from './HintGap.scss';

type Props = {||};

@observer
export default class HintGap extends React.Component<Props> {
  render() {
    return (
      <div className={styles.component} />
    );
  }
}
