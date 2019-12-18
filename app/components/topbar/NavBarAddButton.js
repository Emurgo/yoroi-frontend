// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import styles from './NavBarAddButton.scss';

const messages = defineMessages({
  addButtonText: {
    id: 'wallet.nav.addButton',
    defaultMessage: '!!!Add new wallet',
  }
});

type Props = {|
  +onClick: void => void,
|};

@observer
export default class NavBarAddButton extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
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
        {intl.formatMessage(messages.addButtonText)}
      </button>
    );
  }
}
