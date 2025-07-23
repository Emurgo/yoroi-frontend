// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import { defineMessages, IntlContext, FormattedMessage } from 'react-intl';
import styles from './UriAccept.scss';
import { ReactComponent as UriPrompt }  from '../../../assets/images/uri/uri-prompt.inline.svg';
import globalMessages from '../../../i18n/global-messages';
import { strong, em } from '../../../i18n/htmlEmbeddedMessageHelper';

const messages = defineMessages({
  seePrompt: {
    id: 'profile.uriAccept.seePrompt',
    defaultMessage: '!!!Simply <strong>click <em>Allow</em></strong> to enable payment URLs',
  },
});

type Props = {|
  +onConfirm: void => PossiblyAsync<void>,
  +onBack: void => void,
|};

@observer
export default class UriAccept extends Component<Props> {
  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;

    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>
          <span className={styles.aboutSvg}>
            <UriPrompt />
          </span>

          <div className={styles.explanation}>
            <FormattedMessage {...messages.seePrompt} values={{ strong, em }}/>
          </div>

          <div className={styles.buttonsWrapper}>
            <Button variant="secondary" onClick={this.props.onBack} sx={{ width: '287px' }}>
              {intl.formatMessage(globalMessages.backButtonLabel)}
            </Button>

            <Button
              variant="primary"
              className="finishButton"
              onClick={this.props.onConfirm}
              sx={{ width: '287px' }}
            >
              {intl.formatMessage(globalMessages.finish)}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
