/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './SignTxPage.scss';
import classNames from 'classnames';

import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';

// import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
// import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import WalletCard from '../connect/WalletCard';
import CopyableAddress from '../../../components/widgets/CopyableAddress';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../../components/widgets/hashWrappers/RawHash';
import { truncateAddressShort } from '../../../utils/formatters';
import config from '../../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';

const messages = defineMessages({
  subtitle: {
    id: 'ergo-connector.label.connect',
    defaultMessage: '!!!Connect to',
  },
});

type Props = {|
  accounts: Array<Object>,
  loading: 'idle' | 'pending' | 'success' | 'rejected',
  error: string,
  message?: {| tabId: number, url: string |},
  onToggleCheckbox: number => void,
  onCancel: () => void,
  onConnect: number => void,
  handleSubmit: () => void,
|};

@observer
class SignTxPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        walletPassword: {
          type: 'password',
          label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
          placeholder: this.context.intl.formatMessage(
            globalMessages.walletPasswordFieldPlaceholder
          ),
          value: '',
          validators: [
            ({ field }) => {
              if (field.value === '') {
                return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
              }
              return [true];
            },
          ],
        },
      },
    },
    {
      options: {
        validateOnChange: true,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  submit(): void {
    this.form.submit({
      onSuccess: async form => {
        const { walletPassword } = form.values();
        const transactionData = {
          password: walletPassword,
        };
        // await this.props.onSubmit(transactionData);
      },
      onError: () => {},
    });
  }

  selectWallet: () => void = label => {
    alert(label);
  };
  render(): Node {
    const { form } = this;

    const languageSelectClassNames = classNames([
      styles.language,
      true ? styles.submitLanguageSpinner : null,
    ]);
    const walletPasswordField = form.$('walletPassword');

    const { intl } = this.context;
    return (
      <div className={styles.component}>
        <Select
          className={languageSelectClassNames}
          options={[
            {
              label: 'Selected Wallet',
              value: 'wallet1',
              name: 'Paul Wallet',
              balance: '200000',
            },
            {
              label: 'Selected Wallet',
              value: 'wallet2',
              name: 'Ergo Test Wallet',
              balance: '2001212000',
            },
          ]}
          label="Selected wallet"
          // value={}
          onChange={this.selectWallet}
          skin={SelectSkin}
          optionRenderer={option => <WalletCard name={option.name} balance={option.balance} />}
        />
        <div className={styles.row}>
          <p className={styles.label}>Transaction Id</p>
          <p className={styles.value}>
            addr1q8u4rxgja2hm70ccumwnsvyecrjmznvec86fssuy96e59p63ag5r0s2gt87ts2p8jv8st2us94el3ds54gdf40tmv86qagete6
          </p>
        </div>
        <div className={styles.details}>
          <div>
            <p className={styles.label}>Amount</p>
            <p className={styles.amount}>456,45.000000 ADA</p>
            <p className={styles.stablecoins}>100 Chris stablecoins</p>
            <p className={styles.tokens}>2 Marta tokens</p>
          </div>
          <div className={styles.transactionFee}>
            <p className={styles.label}>Fee</p>
            <p>5.050088 ADA</p>
          </div>
        </div>
        <div className={styles.row}>
          <p className={styles.label}>Total</p>
          <p className={styles.totalValue}>456,45.000000 ADA</p>
        </div>
        <div className={styles.address}>
          <div className={styles.addressFrom}>
            <p className={styles.label}>
              From adresses: <span>4</span>
            </p>
            <div className={styles.addressFromList}></div>
          </div>
          <div className={styles.addressTo}>
            <p className={styles.label}>
              To adresses: <span>4</span>
            </p>
            <div className={styles.addressToList}>
              <div className={styles.addressToItem}>
                {/* <CopyableAddress
                  hash="hash"
                  elementId="address-copyNotification"
                  // onCopyAddress={() => alert('hash', 'address-copyNotification')}
                  // notification=""
                >
                  <ExplorableHashContainer
                    // selectedExplorer=""
                    hash="hash"
                    linkType="address"
                  >
                    <RawHash light>
                      <span
                        className={classNames([
                          styles.addressHash,
                          true === true && styles.addressHashUsed,
                        ])}
                      >
                        {truncateAddressShort(
                          'asdasdaksjdbakbqwei12312k312k3hiu1u3i1ih3123123i12123h'
                        )}
                      </span>
                    </RawHash>
                  </ExplorableHashContainer>
                </CopyableAddress> */}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.passwordInput}>
          <Input
            type="password"
            className={styles.walletPassword}
            {...walletPasswordField.bind()}
            // disabled
            error={walletPasswordField.error}
            skin={InputOwnSkin}
          />
        </div>
        <div className={styles.wrapperBtn}>
          <Button
            className="secondary"
            label={intl.formatMessage(globalMessages.cancel)}
            skin={ButtonSkin}
            // onClick={onCancel}
          />
          <Button
            label={intl.formatMessage(globalMessages.confirm)}
            skin={ButtonSkin}
            disabled
            // onClick={handleSubmit}
          />
        </div>
      </div>
    );
  }
}

export default SignTxPage;
