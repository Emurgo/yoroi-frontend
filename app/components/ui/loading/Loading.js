import React from 'react';
import { CircularProgress } from 'material-ui/Progress';
import style from './Loading.css';

const Loading = () => (
  <div className={style.loadingContainer} >
    <CircularProgress />
  </div>
);

export default Loading;
