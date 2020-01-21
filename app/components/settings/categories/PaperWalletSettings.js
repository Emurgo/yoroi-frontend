// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { Select } from 'react-polymorph/lib/components/Select';
import { Button } from 'react-polymorph/lib/components/Button';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './PaperWalletSettings.scss';
import ReactMarkdown from 'react-markdown';
import type { Node } from 'react';
import { CheckboxOwnSkin } from '../../../themes/skins/CheckboxOwnSkin';

const messages = defineMessages({
  numAddressesSelectLabel: {
    id: 'settings.paperWallet.numAddressesSelect.label',
    defaultMessage: '!!!Number of addresses',
  },
  printIdentificationSelectLabel: {
    id: 'settings.paperWallet.printIdentificationCheckbox.label',
    defaultMessage: '!!!Print Paper Wallet account checksum',
  },
  printIdentificationMessage: {
    id: 'settings.paperWallet.printIdentificationCheckbox.description',
    defaultMessage: '!!!Enabling this will forfeit plausible deniability',
  },
  createPaperLabel: {
    id: 'settings.paperWallet.createPaper.label',
    defaultMessage: '!!!Create Paper Wallet',
  },
});

type Props = {|
  +onCreatePaper: {| numAddresses: number, printAccountPlate: boolean |} => void,
  +dialog: Node,
  +paperWalletsIntroText: string,
  +isDialogOpen: boolean,
  +error?: ?LocalizableError,
|};

@observer
export default class PaperWalletSettings extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  createPaper = () => {
    const { numAddresses, printPaperWalletIdentification } = this.form.values();
    this.props.onCreatePaper({
      numAddresses: parseInt(numAddresses, 10),
      printAccountPlate: printPaperWalletIdentification,
    });
  };

  form = new ReactToolboxMobxForm({
    fields: {
      numAddresses: {
        label: this.context.intl.formatMessage(messages.numAddressesSelectLabel),
        value: '1',
      },
      printPaperWalletIdentification: {
        label: this.context.intl.formatMessage(messages.printIdentificationSelectLabel),
        value: true,
      },
    }
  });

  setPrintPaperIdentification = (printPaperWalletIdentification: boolean) => {
    this.form.$('printPaperWalletIdentification').value = printPaperWalletIdentification;
  };

  render() {
    const { intl } = this.context;
    const { error, isDialogOpen, dialog, paperWalletsIntroText } = this.props;
    const numAddresses = this.form.$('numAddresses');
    const printPaperWalletIdentification = this.form.$('printPaperWalletIdentification');
    const numAddressOptions = [...Array(5).keys()].map(x => ({ value: `${x + 1}`, label: `${x + 1}` }));
    const componentClassNames = classNames([styles.component, 'general']);
    const numAddressesSelectClassNames = classNames([styles.numAddressesSelect]);
    const buttonClassNames = classNames([
      'primary',
      styles.button,
      'createPaperWallet' // classname for UI tests
    ]);
    return (
      <div className={componentClassNames}>

        <div className={styles.intro}>
          <ReactMarkdown source={paperWalletsIntroText} escapeHtml={false} />
        </div>

        <Select
          className={numAddressesSelectClassNames}
          options={numAddressOptions}
          {...numAddresses.bind()}
          skin={SelectSkin}
          isOpeningUpward // need this to make sure all options still show on small screens
        />

        <Checkbox
          skin={CheckboxOwnSkin}
          {...printPaperWalletIdentification.bind()}
          checked={printPaperWalletIdentification.value}
          onChange={this.setPrintPaperIdentification}
          label={this.context.intl.formatMessage(messages.printIdentificationSelectLabel)}
          description={this.context.intl.formatMessage(messages.printIdentificationMessage)}
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

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

      </div>
    );
  }

}
