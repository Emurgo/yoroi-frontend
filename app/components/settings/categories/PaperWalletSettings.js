// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Select } from 'react-polymorph/lib/components/Select';
import { Button } from 'react-polymorph/lib/components/Button';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './PaperWalletSettings.scss';
import ReactMarkdown from 'react-markdown';

const messages = defineMessages({
  numAddressesSelectLabel: {
    id: 'settings.paperWallet.numAddressesSelect.label',
    defaultMessage: '!!!Number of addresses',
  },
  createPaperLabel: {
    id: 'settings.paperWallet.createPaper.label',
    defaultMessage: '!!!Create Paper Wallet',
  },
});

type Props = {
  onCreatePaper: Function,
  dialog: Node,
  paperWalletsIntroText: string,
  isDialogOpen: boolean,
  error?: ?LocalizableError,
};

@observer
export default class PaperWalletSettings extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  createPaper = () => {
    const { numAddresses } = this.form.values();
    this.props.onCreatePaper({ numAddresses: parseInt(numAddresses) });
  };

  form = new ReactToolboxMobxForm({
    fields: {
      numAddresses: {
        label: this.context.intl.formatMessage(messages.numAddressesSelectLabel),
        value: '1',
      },
    }
  }, {
    options: {
      validateOnChange: false,
    },
  });

  render() {
    const { error, isDialogOpen, dialog, paperWalletsIntroText } = this.props;
    const numAddresses = this.form.$('numAddresses');
    const numAddressOptions = [...Array(5).keys()].map(x => ({ value: `${x + 1}`, label: `${x + 1}` }));
    const componentClassNames = classNames([styles.component, 'general']);
    const numAddressesSelectClassNames = classNames([styles.numAddressesSelect]);
    const buttonClassNames = classNames([
      "primary",
      styles.button
    ]);
    return (
      <div className={componentClassNames}>

        <div className={styles.intro}>
          <ReactMarkdown
            source={paperWalletsIntroText} />
        </div>

        <Select
          className={numAddressesSelectClassNames}
          options={numAddressOptions}
          {...numAddresses.bind()}
          skin={SelectSkin}
        />

        <Button
          className={buttonClassNames}
          label={this.context.intl.formatMessage(messages.createPaperLabel)}
          skin={ButtonSkin}
          onClick={this.createPaper}
        />

        {isDialogOpen ? (
          <div>{dialog}</div>
        ) : null}

        {error && <p className={styles.error}>{error}</p>}

      </div>
    );
  }

}
