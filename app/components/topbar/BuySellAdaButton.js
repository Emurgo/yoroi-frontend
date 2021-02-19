// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';
import styles from './BuySellAdaButton.scss';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classnames  from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

type Props = {||};

const EXCHANGE_URL = 'https://exchange.yoroiwallet.com';

@observer
export default class BuySellAdaButton extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {

    const { intl } = this.context;

    return (
      <Button
        label={intl.formatMessage(globalMessages.buySellAda)}
        className={classnames([styles.button, 'secondary'])}
        onClick={() => window.open(EXCHANGE_URL, '_blank')}
        skin={ButtonSkin}
      />
    );
  }
}
