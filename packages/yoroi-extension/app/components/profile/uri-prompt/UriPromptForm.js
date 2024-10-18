// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import { defineMessages, intlShape } from 'react-intl';
import styles from './UriPromptForm.scss';
import { ReactComponent as AboutUri }  from '../../../assets/images/uri/about-url.inline.svg';
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
|};

@observer
export default class UriPromptForm extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>
          <span className={styles.aboutSvg}>
            {<AboutUri/>}
          </span>

          <div className={styles.explanation}>
            <h1>{intl.formatMessage(messages.uriHeading)}</h1>
            <div>{intl.formatMessage(messages.uriExplanation)}</div>
          </div>

          <div className={styles.buttonsWrapper}>
            <Button
              variant="secondary"
              onClick={this.props.onSkip}
              sx={{ width: '240px' }}
            >
              {intl.formatMessage(globalMessages.skipLabel)}
            </Button>

            <Button
              className="allowButton"
              variant="primary"
              onClick={this.props.onAccept}
              sx={{ width: '240px' }}
            >
              {intl.formatMessage(globalMessages.allowLabel)}
            </Button>
          </div>
        </div>
      </div>
    );
  }

}
