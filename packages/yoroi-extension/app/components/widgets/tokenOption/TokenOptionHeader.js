// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import classnames from 'classnames';

import styles from './TokenOptionRow.scss';

type Props = {|
|};

@observer
export default class TokenOptionHeader extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={classnames([styles.container, styles.headerText])}>
        <span>{intl.formatMessage(globalMessages.name)}</span>
        <span>{intl.formatMessage(globalMessages.id)}</span>
        <span>{intl.formatMessage(globalMessages.amount)}</span>
      </div>
    );
  }
}
