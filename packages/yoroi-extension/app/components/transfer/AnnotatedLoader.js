// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import LoadingSpinner from '../widgets/LoadingSpinner';
import styles from './AnnotatedLoader.scss';
import { Typography } from '@mui/material';

type Props = {|
  +title: string,
  +details: string,
|};

@observer
export default class AnnotatedLoader extends Component<Props> {
  render(): Node {
    const { title, details } = this.props;

    return (
      <div className={styles.component}>
        <div className={styles.body}>
          <div className={styles.spinner}>
            <LoadingSpinner />
          </div>
          <Typography className={styles.title} color="ds.text_gray_medium">
            {title}
          </Typography>
          <Typography className={styles.progressInfo} color="ds.text_gray_medium">
            {details}
          </Typography>
        </div>
      </div>
    );
  }
}
