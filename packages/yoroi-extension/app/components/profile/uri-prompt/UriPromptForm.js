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
  uriExplanationLine1: {
    id: 'profile.uriPrompt.form.explanation',
    defaultMessage: '!!!Do you want to enable Cardano payment URLs?',
  },
  uriExplanationLine2: {
    id: 'profile.uriPrompt.form.explanationLine2',
    defaultMessage: '!!!Yoroi allows you to generate special links that you can share with someone else and allow them to make an easy payment to you. You will be able to create these links right away.',
  },
  uriExplanationLine3: {
    id: 'profile.uriPrompt.form.explanationLine3',
    defaultMessage: '!!!But to allow you to click on such links you need to give Yoroi a special permission in the browser. Click "Allow" if you wish to do so.',
  },
  uriExplanationLine4: {
    id: 'profile.uriPrompt.form.explanationLine4',
    defaultMessage: '!!!You don\'t have to decide right now, you can always enable this feature in the \"Settings > Blockchain\" section.',
  },
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
            <p>{intl.formatMessage(messages.uriExplanationLine1)}</p>
            <p>{intl.formatMessage(messages.uriExplanationLine2)}</p>
            <p>{intl.formatMessage(messages.uriExplanationLine3)}</p>
            <p>{intl.formatMessage(messages.uriExplanationLine4)}</p>
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
