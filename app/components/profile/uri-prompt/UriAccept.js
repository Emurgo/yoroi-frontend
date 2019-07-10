// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import SvgInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import styles from './UriAccept.scss';
import uriPrompt from '../../../assets/images/uri/uri-prompt.inline.svg';
import globalMessages from '../../../i18n/global-messages';
import WarningBox from '../../widgets/WarningBox';

const messages = defineMessages({
  seePrompt: {
    id: 'profile.uriAccept.seePrompt',
    defaultMessage: '!!!Simply <strong>click <em>Allow</em></strong> to enable payment URLs',
  },
});

type Props = {|
  onConfirm: void => void,
  onBack: void => void,
  openSettingsPage: void => void,
  classicTheme: boolean
|};

@observer
export default class UriAccept extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const allowButtonClasses = classnames([
      'finishButton',
      'primary',
      styles.submitButton,
    ]);
    const skipButtonClasses = classnames([
      this.props.classicTheme ? 'flat' : 'outlined',
      styles.submitButton,
    ]);

    const browserSettingsLink = (
      <button
        type="button"
        onClick={_event => this.props.openSettingsPage()}
      >
        {intl.formatMessage(globalMessages.browserSettings)}
      </button>
    );
    const noPromptWarning = (
      <WarningBox>
        {intl.formatMessage(globalMessages.promptWarningLine1)}<br />
        <FormattedMessage {...globalMessages.promptWarningLine2} values={{ browserSettingsLink }} />
      </WarningBox>
    );

    return (
      <div className={styles.component}>
        <div className={styles.warningBox}>
          {noPromptWarning}
        </div>
        <div className={styles.centeredBox}>

          <SvgInline svg={uriPrompt} className={styles.aboutSvg} />

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
