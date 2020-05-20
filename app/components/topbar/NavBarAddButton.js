// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';
import styles from './NavBarAddButton.scss';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +onClick: void => void,
|};

@observer
export default class NavBarAddButton extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      onClick,
    } = this.props;

    const { intl } = this.context;

    return (
      <button
        type="button"
        className={styles.button}
        onClick={() => onClick()}
      >
        {intl.formatMessage(globalMessages.addWalletLabel)}
      </button>
    );
  }
}
