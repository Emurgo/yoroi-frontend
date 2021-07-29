// @flow
import type { Node } from 'react';
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
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  uriHeading: {
    id: 'profile.uriPrompt.form.heading',
    defaultMessage: 'Allow Cardano Payment URLs'
  },
  uriExplanation: {
    id: 'profile.uriPrompt.form.explanation',
    defaultMessage: '!!!Yoroi will allow you to generate special links in Receive page and share it in order to receive payment faster and easier. You can always enable this feature in the Settings.',
  }
});

type Props = {|
  +onAccept: void => void,
  +onSkip: void => void,
  +classicTheme: boolean
|};

@observer
export default class UriPromptForm extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
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
            <h1>{intl.formatMessage(messages.uriHeading)}</h1>
            <p>{intl.formatMessage(messages.uriExplanation)}</p>
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
