// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import WarningHeader from './WarningHeader';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import globalMessages from '../../../i18n/global-messages';
import { addressTypes } from '../../../types/AddressFilterTypes';
import styles from './MangledHeader.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  warning1: {
    id: 'wallet.receive.page.mangledWarning1',
    defaultMessage: '!!!Mangled addresses contribute to your ADA balance but have the incorrect delegation preference'
  },
  fixLabel: {
    id: 'wallet.receive.page.unmangeLabel',
    defaultMessage: '!!!Correct delegation preference'
  },
});

type Props = {|
  +hasMangledUtxo: boolean;
  +onClick: void => void,
|};

@observer
export default class MangledHeader extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const buttonClasses = classnames([
      'primary',
      styles.submitButton,
    ]);
    return (
      <>
        <WarningHeader
          message={(
            <>
              <p>{intl.formatMessage(messages.warning1)}</p><br />
              <p>
                {intl.formatMessage(addressTypes.mangled)}&nbsp;
                <FormattedHTMLMessage {...globalMessages.auditAddressWarning} />
              </p>
            </>
          )}
        >
          {this.props.hasMangledUtxo && (
            <Button
              className={buttonClasses}
              label={intl.formatMessage(messages.fixLabel)}
              onClick={this.props.onClick}
              skin={ButtonSkin}
            />
          )}
        </WarningHeader>
      </>
    );
  }
}
