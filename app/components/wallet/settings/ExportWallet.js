// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classNames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import styles from './ExportWallet.scss';
import dangerousButtonStyles from '../../../themes/overrides/DangerousButton.scss';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

export const messages: * = defineMessages({
  titleLabel: {
    id: 'wallet.settings.export.label',
    defaultMessage: '!!!Export wallet',
  },
  exportExplanation: {
    id: 'wallet.settings.export.explanation',
    defaultMessage: '!!!This can be used to transfer a wallet between devices.',
  },
});

type Props = {|
  +openDialog: void => void,
|};

@observer
export default class ExportWallet extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const buttonClassNames = classNames([
      'primary',
      styles.submitButton,
      'exportWallet' // classname for UI tests
    ]);
    return (
      <div className={styles.component}>
        <h2>{intl.formatMessage(messages.titleLabel)}</h2>

        <p>
          {intl.formatMessage(messages.exportExplanation)}
        </p>

        <Button
          themeOverrides={dangerousButtonStyles}
          className={buttonClassNames}
          label={`${this.context.intl.formatMessage(globalMessages.exportButtonLabel)}`}
          skin={ButtonSkin}
          onClick={this.props.openDialog}
        />
      </div>
    );
  }
}
