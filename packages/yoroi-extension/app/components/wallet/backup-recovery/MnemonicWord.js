// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Button } from '@mui/material';
import styles from './MnemonicWord.scss';

type Props = {|
  +word: string,
  +index: number,
  +isActive: boolean,
  +onClick: {| index: number, word: string |} => void,
|};

@observer
export default class MnemonicWord extends Component<Props> {
  render(): Node {
    const { word, index, isActive, onClick } = this.props;
    const handleClick = onClick.bind(null, { word, index });

    const componentClasses = classnames([
      styles.component
    ]);

    return (
      <Button
        variant={'primary'}
        className={componentClasses}
        disabled={!isActive}
        onClick={handleClick}
      >
        {word}
      </Button>
    );
  }
}
