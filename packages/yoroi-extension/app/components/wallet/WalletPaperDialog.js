// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import Select from '../common/Select';
import { MenuItem } from '@mui/material';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './WalletPaperDialog.scss';
import ReactMarkdown from 'react-markdown';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';

const messages = defineMessages({
  numAddressesSelectLabel: {
    id: 'settings.paperWallet.numAddressesSelect.label',
    defaultMessage: '!!!Number of addresses',
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
  +onCreatePaper: ({| numAddresses: number |}) => void,
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
    const { numAddresses } = this.form.values();
    this.props.onCreatePaper({
      numAddresses: parseInt(numAddresses, 10),
    });
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      numAddresses: {
        label: this.context.intl.formatMessage(messages.numAddressesSelectLabel),
        value: '1',
      },
    },
  });

  render(): Node {
    const { intl } = this.context;
    const { error, paperWalletsIntroText, onCancel } = this.props;
    const numAddresses = this.form.$('numAddresses');
    const numAddressOptions = [...Array(5).keys()].map(x => ({
      value: `${x + 1}`,
      label: `${x + 1}`,
    }));
    const componentClassNames = classNames([styles.component, 'general']);

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
          formControlProps={{ sx: { margin: '34px 0 12px 0' } }}
          labelId="number-address-option-select"
          {...numAddresses.bind()}
          menuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            sx: {
              '& .MuiMenu-paper': {
                marginTop: '-60px',
                maxHeight: '280px',
              },
            },
          }}
        >
          {numAddressOptions.map(item => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>

        {error && <p className={styles.error}>{intl.formatMessage(error, error.values)}</p>}
      </Dialog>
    );
  }
}
