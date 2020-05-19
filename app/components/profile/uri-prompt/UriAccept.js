// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import styles from './UriAccept.scss';
import UriPrompt from '../../../assets/images/uri/uri-prompt.inline.svg';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  seePrompt: {
    id: 'profile.uriAccept.seePrompt',
    defaultMessage: '!!!Simply <strong>click <em>Allow</em></strong> to enable payment URLs',
  },
});

type Props = {|
  +onConfirm: void => PossiblyAsync<void>,
  +onBack: void => void,
  +classicTheme: boolean
|};

@observer
export default class UriAccept extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const allowButtonClasses = classnames([
      'finishButton',
      'primary',
      styles.submitButton,
    ]);
    const skipButtonClasses = classnames([
      'secondary',
      styles.submitButton,
    ]);

    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>

          <span className={styles.aboutSvg}><UriPrompt /></span>

          <div className={styles.explanation}>
            <FormattedHTMLMessage {...messages.seePrompt} />
          </div>

          <div className={styles.buttonsWrapper}>
            <Button
              className={skipButtonClasses}
              label={intl.formatMessage(globalMessages.backButtonLabel)}
              onMouseUp={this.props.onBack}
              skin={ButtonSkin}
            />

            <Button
              className={allowButtonClasses}
              label={intl.formatMessage(globalMessages.finish)}
              onMouseUp={this.props.onConfirm}
              skin={ButtonSkin}
            />
          </div>
        </div>
      </div>
    );
  }

}
