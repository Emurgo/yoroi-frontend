// @flow
import React, { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './BuySellAdaButton.scss';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { withLayout } from '../../themes/context/layout';
import type { LayoutComponentMap } from '../../themes/context/layout';

type Props = {|
  +onBuySellClick: void => void,
|};

type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

@observer
class BuySellAdaButton extends Component<Props & InjectedProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const BuyAdaButtonClassic = (
      <Button
        label={intl.formatMessage(globalMessages.buySellAda)}
        className={classnames([styles.button, 'secondary'])}
        onClick={() => this.props.onBuySellClick()}
        skin={ButtonSkin}
      />
    );

    const BuyAdaButtonRevamp = (
      <Button
        label={intl.formatMessage(globalMessages.buySellAda)}
        className={styles.buttonRevamp}
        onClick={() => this.props.onBuySellClick()}
        skin={ButtonSkin}
      />
    );

    return this.props.renderLayoutComponent({
      CLASSIC: BuyAdaButtonClassic,
      REVAMP: BuyAdaButtonRevamp,
    });
  }
}

export default (withLayout(BuySellAdaButton): ComponentType<Props>);
