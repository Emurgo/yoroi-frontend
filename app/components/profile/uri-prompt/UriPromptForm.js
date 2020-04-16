// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import styles from './UriPromptForm.scss';
import AboutUri from '../../../assets/images/uri/about-url.inline.svg';
import AboutUriClassic from '../../../assets/images/uri/about-url-classic.inline.svg';
import globalMessages from '../../../i18n/global-messages';

const messages = defineMessages({
  explanationLine1: {
    id: 'profile.uriPrompt.form.explanation',
    defaultMessage: '!!!Do you want to enable Cardano payment URLs?',
  },
});

type Props = {|
  +onAccept: void => void,
  +onSkip: void => void,
  +classicTheme: boolean
|};

@observer
export default class UriPromptForm extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const allowButtonClasses = classnames([
      'allowButton',
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

          <span className={styles.aboutSvg}>
            {this.props.classicTheme
              ? <AboutUriClassic />
              : <AboutUri />
            }
          </span>

          <div className={styles.explanation}>
            {intl.formatMessage(messages.explanationLine1)}&nbsp;
            {intl.formatMessage(globalMessages.uriExplanation)}
          </div>

          <div className={styles.buttonsWrapper}>
            <Button
              className={skipButtonClasses}
              label={intl.formatMessage(globalMessages.skipLabel)}
              onMouseUp={this.props.onSkip}
              skin={ButtonSkin}
            />

            <Button
              className={allowButtonClasses}
              label={intl.formatMessage(globalMessages.allowLabel)}
              onMouseUp={this.props.onAccept}
              skin={ButtonSkin}
            />
          </div>
        </div>
      </div>
    );
  }

}
