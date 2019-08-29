// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import globalMessages from '../../../i18n/global-messages';
import styles from './ExternalStorageSettings.scss';

/*const messages = defineMessages({
  faqTitle: {
    id: 'settings.support.faq.title',
    defaultMessage: '!!!Frequently asked questions',
  },
});*/

type Props = {|
  onExternalLinkClick: Function,
|};

@observer
export default class ExternalStorageSettings extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { onExternalLinkClick } = this.props;
    const { intl } = this.context;

    const buttonClasses = classnames([
      'primary',
    ]);

    return (
      <div className={styles.component}>
        <h1>Connect to Dropbox</h1>

        <p>Add memos</p>

        <Button
          className={buttonClasses}
          label="Connect"
          skin={ButtonSkin}
        />

      </div>
    );
  }

}
