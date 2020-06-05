// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './WalletPaperDialog.scss';
import ReactMarkdown from 'react-markdown';
import { CheckboxOwnSkin } from '../../themes/skins/CheckboxOwnSkin';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';

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
  +onCancel: void => void,
  +paperWalletsIntroText: string,
  +error?: ?LocalizableError,
|};

@observer
export default class PaperWalletDialog extends Component<Props> {
  static defaultProps: {|error: void|} = {
    error: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  createPaper: (() => void) = () => {
    const { numAddresses, printPaperWalletIdentification } = this.form.values();
    this.props.onCreatePaper({
      numAddresses: parseInt(numAddresses, 10),
      printAccountPlate: printPaperWalletIdentification,
    });
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
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

  setPrintPaperIdentification: ((
    printPaperWalletIdentification: boolean
  ) => void) = (printPaperWalletIdentification) => {
    this.form.$('printPaperWalletIdentification').value = printPaperWalletIdentification;
  };

  render(): Node {
    const { intl } = this.context;
    const { error, paperWalletsIntroText, onCancel } = this.props;
    const numAddresses = this.form.$('numAddresses');
    const printPaperWalletIdentification = this.form.$('printPaperWalletIdentification');
    const numAddressOptions = [...Array(5).keys()].map(x => ({ value: `${x + 1}`, label: `${x + 1}` }));
    const componentClassNames = classNames([styles.component, 'general']);
    const numAddressesSelectClassNames = classNames([styles.numAddressesSelect]);

    const actions = [
      {
        label: this.context.intl.formatMessage(messages.createPaperLabel),
        primary: true,
        onClick: this.createPaper,
      },
    ];

    return (
      <Dialog
        className={componentClassNames}
        title={intl.formatMessage(messages.createPaperLabel)}
        closeOnOverlayClick={false}
        onClose={onCancel}
        actions={actions}
        closeButton={<DialogCloseButton />}
      >

        <div className={styles.intro}>
          <ReactMarkdown source={paperWalletsIntroText} escapeHtml={false} />
        </div>

        <Select
          className={numAddressesSelectClassNames}
          options={numAddressOptions}
          {...numAddresses.bind()}
          skin={SelectSkin}
          isOpeningUpward
        />

        <Checkbox
          skin={CheckboxOwnSkin}
          {...printPaperWalletIdentification.bind()}
          checked={printPaperWalletIdentification.value}
          onChange={this.setPrintPaperIdentification}
          label={this.context.intl.formatMessage(messages.printIdentificationSelectLabel)}
          description={this.context.intl.formatMessage(messages.printIdentificationMessage)}
        />

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

      </Dialog>
    );
  }

}
