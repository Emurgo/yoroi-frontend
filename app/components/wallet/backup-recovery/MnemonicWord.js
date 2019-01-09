// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import styles from './MnemonicWord.scss';

type Props = {
  word: string,
  index: number,
  isActive: boolean,
  onClick: Function,
  oldTheme: boolean
};

@observer
export default class MnemonicWord extends Component<Props> {

  render() {
    const { word, index, isActive, onClick, oldTheme } = this.props;
    const componentClassNames = oldTheme ? classnames([
      'flat',
      styles.componentOld,
      isActive ? styles.activeOld : styles.inactiveOld
    ]) : classnames([
      styles.component,
      isActive ? styles.active : styles.inactive
    ]);
    return (
      <Button
        className={componentClassNames}
        label={word}
        onClick={() => onClick({ word, index })}
        skin={<SimpleButtonSkin />}
      />
    );
  }

}
