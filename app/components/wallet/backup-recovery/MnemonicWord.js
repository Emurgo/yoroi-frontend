// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import styles from './MnemonicWord.scss';

type Props = {
  word: string,
  index: number,
  isActive: boolean,
  onClick: Function,
  classicTheme: boolean
};

@observer
export default class MnemonicWord extends Component<Props> {
  render() {
    const { word, index, isActive, onClick, classicTheme } = this.props;
    const handleClick = onClick.bind(null, { word, index });

    const componentClasses = classnames([
      classicTheme ? 'flat' : null,
      classicTheme ? styles.componentClassic : styles.component,
    ]);

    return (
      <Button
        className={componentClasses}
        themeOverrides={styles}
        disabled={!isActive}
        label={word}
        onClick={handleClick}
        skin={ButtonSkin}
      />
    );
  }
}
