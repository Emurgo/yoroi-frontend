// @flow
import { Component } from 'react';
import type { Element, Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './WalletRecoveryPhraseMnemonic.scss';

type Props = {|
  +phrase: string | Element<any>,
  +filled?: boolean,
  +phraseDoesNotMatch?: string,
|};

@observer
export default class WalletRecoveryPhraseMnemonic extends Component<Props> {
  static defaultProps: {|filled: void, phraseDoesNotMatch: string |} = {
    filled: undefined,
    phraseDoesNotMatch: ''
  }

  render(): Node {
    const { phrase, filled, phraseDoesNotMatch } = this.props;
    const componentClasses = classnames([
      styles.component,
      filled === true ? styles.filled : '',
      phraseDoesNotMatch != null ? styles.phraseDoesNotMatch : '',
    ]);
    return (
      <div>
        <div className={componentClasses}>{phrase}</div>
        <div className={styles.errorText}>{phraseDoesNotMatch}</div>
      </div>
    );
  }

}
