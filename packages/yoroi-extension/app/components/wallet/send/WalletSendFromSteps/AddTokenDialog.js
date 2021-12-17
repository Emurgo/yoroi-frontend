// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import React, { Component, } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import TextField from '../../../common/TextField';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './AddTokenDialog.scss';
import config from '../../../../config';
import ExplorableHashContainer from '../../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../../widgets/hashWrappers/RawHash';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../../../utils/unit-of-account';
import WarningBox from '../../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  truncateAddress, truncateToken,
} from '../../../../utils/formatters';
import {
  MultiToken,
} from '../../../../api/common/lib/MultiToken';
import type {
  TokenLookupKey, TokenEntry,
} from '../../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName, genFormatTokenAmount, getTokenStrictName, getTokenIdentifierIfExists, } from '../../../../stores/stateless/tokenHelpers';
import SearchIcon from '../../../../assets/images/assets-page/search.inline.svg';
import ArrowsListFromBottom from '../../../../assets/images/assets-page/arrows-list-from-bottom.inline.svg';
import ArrowsListFromTop from '../../../../assets/images/assets-page/arrows-list-from-top.inline.svg';
import InfoIcon from '../../../../assets/images/assets-page/info.inline.svg';
import ArrowsList from '../../../../assets/images/assets-page/arrows-list.inline.svg';
import SingleTokenRow from './SingleTokenRow';


type Props = {|
  +onClose: void => void,
  +spendableBalance: ?MultiToken,
|};

type State = {|
  tokensList: Asset[],
  sortingDirection: null | 'UP' | 'DOWN',
  sortingColumn: string
|}


const SORTING_DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN'
}

const SORTING_COLUMNS = {
  LABEL: 'label',
  AMOUNT: 'amount'
}


export const messages: Object = defineMessages({
  nameAndTicker: {
    id: 'wallet.assets.nameAndTicker',
    defaultMessage: '!!!Name and ticker',
  },
  quantity: {
    id: 'wallet.assets.quantity',
    defaultMessage: '!!!Quantity',
  },
  identifier: {
    id: 'wallet.assets.fingerprint',
    defaultMessage: '!!!Fingerprint',
  },
  search: {
    id: 'wallet.assets.search',
    defaultMessage: '!!!Search',
  },
  noAssetFound: {
    id: 'wallet.assets.noAssetFound',
    defaultMessage: '!!!No Asset Found',
  },
  minAda: {
    id: 'wallet.send.form.dialog.minAda',
    defaultMessage: '!!!min-ada'
  },
  add: {
    id: 'wallet.send.form.dialog.add',
    defaultMessage: '!!!add'
  }
});

@observer
export default class AddTokenDialog extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentDidMount(): void {
    this.setState({ tokensList: this.genTokensList() })
  }

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      walletPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.walletPasswordFieldPlaceholder) : '',
        value: '',
        validators: [({ field }) => {
          if (field.value === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          return [true];
        }],
      },
    }
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  state: State = {
    tokensList: [],
    sortingDirection: null,
    sortingColumn: '',
  };

  search: ((e: SyntheticEvent<HTMLInputElement>) => void) =
    (event: SyntheticEvent<HTMLInputElement>) => {
      const keyword = event.currentTarget.value
      this.setState({ tokensList: this.genTokensList() })
      if(!keyword) return
      const regExp = new RegExp(keyword, 'gi')
      const tokensListCopy = [...this.genTokensList()]
      const filteredTokensList = tokensListCopy.filter(a => a.label.match(regExp))
      this.setState({ tokensList: filteredTokensList })
    };

  compare: ((a: any, b: any, field: string) => number) = ( a, b, field ) => {
    let newSortDirection = SORTING_DIRECTIONS.UP
    if (!this.state.sortingDirection) {
      newSortDirection = SORTING_DIRECTIONS.UP
    } else if (this.state.sortingDirection === SORTING_DIRECTIONS.UP) {
      newSortDirection = SORTING_DIRECTIONS.DOWN
    }

    this.setState({ sortingDirection: newSortDirection })

    if ( a[field] < b[field] ){
      return newSortDirection === SORTING_DIRECTIONS.UP ? -1 : 1;
    }
    if ( a[field] > b[field] ){
      return newSortDirection === SORTING_DIRECTIONS.UP ? 1 : -1;
    }
    return 0;
  }

  sortTokens: ((field: string) => void) = (field: string) => {
    const tokensListCopy = [...this.state.tokensList]
    const sortedTokens = tokensListCopy.sort((a,b) => this.compare(a,b, field))
    this.setState({ tokensList: sortedTokens, sortingColumn: field });
  };

  displayColumnLogo: ((column: string) => Node) = (column: string) => {
    const {
        sortingColumn,
        sortingDirection
    } = this.state;
    if (!sortingDirection || sortingColumn !== column) {
      return <ArrowsList />
    }
    if (sortingDirection === SORTING_DIRECTIONS.UP && sortingColumn === column) {
      return <ArrowsListFromTop />
    }
    if (sortingDirection === SORTING_DIRECTIONS.DOWN && sortingColumn === column) {
      return <ArrowsListFromBottom />
    }
    return <ArrowsList />;
  }

  genTokensList: void => void = () => {
      if (this.props.spendableBalance == null) return [];
      const { spendableBalance } = this.props;
      return [
        ...spendableBalance.nonDefaultEntries(),
      ].map(entry => ({
        entry,
        info: this.props.getTokenInfo(entry),
      })).filter(token => !token.info.IsNFT).map(token => {
        const amount = genFormatTokenAmount(this.props.getTokenInfo)(token.entry)
        return {
          value: token.info.TokenId,
          info: token.info,
          label: truncateToken(getTokenStrictName(token.info) ?? getTokenIdentifierIfExists(token.info) ?? '-'),
          id: (getTokenIdentifierIfExists(token.info) ?? '-'),
          amount: Number(amount),
        }
      });
  }

  render(): Node {
    const { form } = this;
    const { intl } = this.context;
    const { onClose } = this.props
    const { tokensList } = this.state
    const walletPasswordField = form.$('walletPassword');
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.nTokens, { number: tokensList.length })}
        closeOnOverlayClick={false}
        className={styles.dialog}
        onClose={onClose}
        closeButton={<DialogCloseButton />}
      >
        <div className={styles.component}>
          <div className={styles.search}>
            <SearchIcon />
            <input onChange={this.search} className={styles.searchInput} type="text" placeholder={intl.formatMessage(messages.search)} />
          </div>
          <div className={styles.minAda}>
            <p><span className={styles.minAdaLabel}>{intl.formatMessage(messages.minAda)}{':'}</span> {0}</p>
          </div>
          {
            tokensList.length === 0 ? (
              <div className={styles.noAssetFound}>
                <h1>{intl.formatMessage(messages.noAssetFound)}</h1>
              </div>
            ): (
              <>
                <ul className={styles.columns}>
                  <li className={styles.name}>
                    <button type='button' onClick={() => this.sortTokens(SORTING_COLUMNS.LABEL)}>
                      <p className={styles.headerText}>
                        {intl.formatMessage(messages.nameAndTicker)}
                      </p>
                      {this.displayColumnLogo(SORTING_COLUMNS.LABEL)}
                    </button>
                  </li>
                  <li className={styles.identifier}>
                    <p className={styles.headerText}>
                      {intl.formatMessage(messages.identifier)}
                    </p>
                    <InfoIcon />
                  </li>
                  <li className={styles.quantity}>
                    <button type='button' onClick={() => this.sortTokens(SORTING_COLUMNS.AMOUNT)}>
                      <p className={styles.headerText}>
                        {intl.formatMessage(messages.quantity)}
                      </p>
                      {this.displayColumnLogo(SORTING_COLUMNS.AMOUNT)}
                    </button>
                  </li>
                </ul>

                {
                  tokensList.map(token => <SingleTokenRow key={token.id} token={token} />)
                }
              </>
            )
          }

          <button type='button' className={styles.add}>{intl.formatMessage(messages.add)}</button>
        </div>
      </Dialog>
    );
  }
}
