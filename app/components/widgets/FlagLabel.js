// @flow
import React, { Component } from 'react';
import styles from './FlagLabel.scss';
import SvgInline from 'react-svg-inline';

type Props = {|
  svg: string,
  label: string,
  width?: string,
  height?: string
|};

export default class FlagLabel extends Component<Props> {

  static defaultProps = {
    width: '18px',
    height: '18px'
  };

  render() {
    const { svg, label, width, height } = this.props;
    return (

      <div className={styles.wrapper}>
        <SvgInline svg={svg} className={styles.flag} width={width} height={height} />
        <span>{label}</span>
      </div>
    );
  }
}
