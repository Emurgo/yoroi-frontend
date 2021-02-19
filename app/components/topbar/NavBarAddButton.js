// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';
import styles from './NavBarAddButton.scss';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classnames  from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

type Props = {|
  +onClick: void => void,
  +isPrimary: boolean,
|};

@observer
export default class NavBarAddButton extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      onClick,
      isPrimary,
    } = this.props;

    const { intl } = this.context;
    const extraClassName = isPrimary ? 'primary' : 'secondary';

    return (
      <Button
        className={classnames([styles.button, extraClassName])}
        onClick={() => onClick()}
        label={intl.formatMessage(globalMessages.addWalletLabel)}
        skin={ButtonSkin}
      />
    );
  }
}
