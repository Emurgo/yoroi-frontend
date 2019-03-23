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
  paperTypeSelectLabel: {
    id: 'settings.paperWallet.paperTypeSelect.label',
    defaultMessage: '!!!Type of paper wallet',
  },
  paperTypeRegular: {
    id: 'settings.paperWallet.paperTypeSelect.regular.label',
    defaultMessage: '!!!30 words',
  },
  paperTypePassword: {
    id: 'settings.paperWallet.paperTypeSelect.password.label',
    defaultMessage: '!!!21 word and a custom password',
  },
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
    const { paperType, numAddresses } = this.form.values();
    const isCustomPassword = paperType === 'password';
    this.props.onCreatePaper({ isCustomPassword, numAddresses });
  };

  form = new ReactToolboxMobxForm({
    fields: {
      numAddresses: {
        label: this.context.intl.formatMessage(messages.numAddressesSelectLabel),
        value: '1',
      },
      paperType: {
        label: this.context.intl.formatMessage(messages.paperTypeSelectLabel),
        value: 'regular',
      },
    }
  }, {
    options: {
      validateOnChange: false,
    },
  });

  render() {
    const { error, isDialogOpen, dialog, paperWalletsIntroText } = this.props;
    const paperType = this.form.$('paperType');
    const numAddresses = this.form.$('numAddresses');
    const paperTypeOptions = [
      { value: 'regular', label: this.context.intl.formatMessage(messages.paperTypeRegular) },
      { value: 'password', label: this.context.intl.formatMessage(messages.paperTypePassword) },
    ];
    const numAddressOptions = [...Array(5).keys()].map(x => ({ value: `${x + 1}`, label: `${x + 1}` }));
    const componentClassNames = classNames([styles.component, 'general']);
    const paperTypeSelectClassNames = classNames([styles.paperTypeSelect]);
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
          className={paperTypeSelectClassNames}
          options={paperTypeOptions}
          {...paperType.bind()}
          skin={SelectSkin}
        />

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
