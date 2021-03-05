// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './WalletNavigation.scss';
import WalletNavButton from './WalletNavButton';

import type { MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';

export type Category = {|
  +className: string,
  +icon?: string,
  +label?: MessageDescriptor,
  +isActive: boolean,
  +onClick: void => void,
|};

type Props = {|
  categories: Array<Category>,
|};

@observer
export default class WalletNavigation extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  renderCategory: Category => ?Node = (category) => {
    const { intl } = this.context;

    return (
      <div
        className={styles.navItem}
        key={category.className}
      >
        <WalletNavButton
          className={category.className}
          label={intl.formatMessage(category.label)}
          icon={category.icon}
          isActive={category.isActive}
          onClick={category.onClick}
        />
      </div>
    );
  }

  render(): Node {
    return (
      <div className={styles.component}>
        {this.props.categories.map(category => this.renderCategory(category))}
      </div>
    );
  }
}
