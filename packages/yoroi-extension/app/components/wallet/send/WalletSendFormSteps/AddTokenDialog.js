// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import styles from './AddTokenDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
    truncateToken,
} from '../../../../utils/formatters';
import {
  MultiToken,
} from '../../../../api/common/lib/MultiToken';
import { genFormatTokenAmount, getTokenStrictName, getTokenIdentifierIfExists, } from '../../../../stores/stateless/tokenHelpers';
import SearchIcon from '../../../../assets/images/assets-page/search.inline.svg';
import ArrowsListFromBottom from '../../../../assets/images/assets-page/arrows-list-from-bottom.inline.svg';
import ArrowsListFromTop from '../../../../assets/images/assets-page/arrows-list-from-top.inline.svg';
import InfoIcon from '../../../../assets/images/assets-page/info.inline.svg';
import ArrowsList from '../../../../assets/images/assets-page/arrows-list.inline.svg';
import SingleTokenRow from './SingleTokenRow';
import NoItemsFoundImg from '../../../../assets/images/dapp-connector/no-websites-connected.inline.svg'



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
  nTokens: {
    id: 'wallet.send.form.dialog.nToken',
    defaultMessage: '!!!Tokens ({number})',
  },
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
  noTokensYet: {
    id: 'wallet.send.form.dialog.noTokensYet',
    defaultMessage: '!!!There are no tokens in your wallet yet'
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
        included: false,
    }
    });
  }

  render(): Node {
    const { intl } = this.context;
    const { onClose } = this.props
    const { tokensList } = this.state

    return (
      <Dialog
        title={intl.formatMessage(messages.nTokens, { number: tokensList.length })}
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
                <NoItemsFoundImg />
                <h1 className={styles.text}>
                  {intl.formatMessage(
                    this.genTokensList().length === 0 ? messages.noTokensYet : messages.noAssetFound
                  )}
                </h1>
              </div>
            ): (
              <div className={styles.columnsContainer}>
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
                  tokensList.map(token => (
                    <SingleTokenRow
                      key={token.id}
                      token={token}
                      classicTheme={this.props.classicTheme}
                      updateAmount={this.props.updateAmount}
                      uriParams={this.props.uriParams}
                      selectedToken={this.props.selectedToken}
                      validateAmount={this.props.validateAmount}
                      defaultToken={this.props.defaultToken}
                      getTokenInfo={this.props.getTokenInfo}
                    />
                  ))
                }
              </div>
            )
          }

          <button type='button' className={styles.add}>{intl.formatMessage(messages.add)}</button>
        </div>
      </Dialog>
    );
  }
}
