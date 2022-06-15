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
  MultiToken,
} from '../../../../api/common/lib/MultiToken';
import { ReactComponent as SearchIcon } from '../../../../assets/images/assets-page/search.inline.svg';
import { ReactComponent as ArrowsListFromBottom } from '../../../../assets/images/assets-page/arrows-list-from-bottom.inline.svg';
import { ReactComponent as ArrowsListFromTop } from '../../../../assets/images/assets-page/arrows-list-from-top.inline.svg';
import { ReactComponent as InfoIcon } from '../../../../assets/images/assets-page/info.inline.svg';
import { ReactComponent as ArrowsList } from '../../../../assets/images/assets-page/arrows-list.inline.svg';
import { ReactComponent as NoItemsFoundImg } from '../../../../assets/images/dapp-connector/no-websites-connected.inline.svg'
import SingleTokenRow from './SingleTokenRow';
import { Button } from '@mui/material';
import type {
  TokenLookupKey,
} from '../../../../api/common/lib/MultiToken';
import type { TokenRow, NetworkRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type { UriParams } from '../../../../utils/URIHandling';
import BigNumber from 'bignumber.js';
import type { FormattedTokenDisplay } from '../../../../utils/wallet'
import LocalizableError from '../../../../i18n/LocalizableError';
import { isCardanoHaskell } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import { compareNumbers, compareStrings } from '../../assets/AssetsList';
import { getTokens } from '../../../../utils/wallet';
import { genFormatTokenAmount } from '../../../../stores/stateless/tokenHelpers';
import MinAda from './MinAda';
import globalMessages from '../../../../i18n/global-messages';
import MaxAssetsError from '../MaxAssetsError';
import { Box } from '@mui/system';

type Props = {|
  +onClose: void => void,
  +spendableBalance: ?MultiToken,
  +classicTheme: boolean,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +updateAmount: (?BigNumber) => void,
  +uriParams: ?UriParams,
  +selectedToken: void | $ReadOnly<TokenRow>,
  +validateAmount: (
    amountInNaturalUnits: BigNumber,
    tokenRow: $ReadOnly<TokenRow>,
  ) => Promise<[boolean, void | string]>,
  +defaultToken: $ReadOnly<TokenRow>,
  +fee: ?MultiToken,
  +totalInput: ?MultiToken,
  +isCalculatingFee: boolean,
  +error: ?LocalizableError,
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +isTokenIncluded: ($ReadOnly<TokenRow>) => boolean,
  +onAddToken: ({|
    token: void | $ReadOnly<TokenRow>,
    shouldReset?: boolean,
    maxAmount?: string,
  |}) => void,
  +onRemoveToken: (void | $ReadOnly<TokenRow>) => void,
  +getTokenAmount: ($ReadOnly<TokenRow>) => ?string,
  +isValidAmount: ($ReadOnly<TokenRow>) => boolean,
|};

type State = {|
  currentTokensList: FormattedTokenDisplay[],
  fullTokensList: FormattedTokenDisplay[],
  sortingDirection: null | 'UP' | 'DOWN',
  sortingColumn: string,
  shouldAddMoreAssets: boolean,
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
    const { spendableBalance, getTokenInfo } = this.props;
    const tokensList = getTokens(spendableBalance, getTokenInfo)
    this.setState({ currentTokensList: tokensList, fullTokensList: tokensList })
  }

  state: State = {
    currentTokensList: [],
    fullTokensList: [],
    sortingDirection: null,
    sortingColumn: '',
    selectedTokens: [],
    error: false,
  };

  onSelect: $ReadOnly<TokenRow> => void = (tokenInfo) => {
    this.setState(prev =>({ selectedTokens: [...prev.selectedTokens, { tokenInfo }] }))
  }

  onRemoveToken = (tokenInfo) => {
    this.setState(prev => ({ ...prev,  selectedTokens: [...prev.selectedTokens].filter(
      ({ tokenInfo: t }) => t.Identifier !== tokenInfo.Identifier) }))
    this.props.onRemoveToken(tokenInfo)
  }

  isTokenIncluded = (tokenInfo) => {
    const isIncluded = this.state.selectedTokens.find(
      ({ tokenInfo: t }) => t.Identifier === tokenInfo?.Identifier
    )
    return isIncluded || this.props.isTokenIncluded(tokenInfo)
  }

  updateAmount = (tokenInfo, amount) => {
    const tokenEntry = this.state.selectedTokens.find(
      ({ tokenInfo: t }) => t.Identifier === tokenInfo.Identifier
    )

    const tokenEntryCopy = { ...tokenEntry };
    tokenEntryCopy.amount = amount;
    tokenEntryCopy.tokenInfo = tokenInfo;

    const filteredTokens = this.state.selectedTokens.filter(
      ({ tokenInfo: t }) => t.Identifier !== tokenInfo.Identifier
    );

    this.setState({ selectedTokens: [...filteredTokens, tokenEntryCopy] });
  }

  getCurrentAmount = (tokenInfo) => {
    const token = this.getSelectedToken(tokenInfo);

    if (!token) return this.props.getTokenAmount(tokenInfo);

    return token.amount;
  }

  getSelectedToken = (tokenInfo) => {
    return this.state.selectedTokens.find(
      ({ tokenInfo: t }) => t.Identifier === tokenInfo.Identifier
    )
  }


  onAddAll = () => {
    for (const { tokenInfo, amount } of this.state.selectedTokens) {
      if (!amount) continue
      this.props.onAddToken({
            token: tokenInfo, shouldReset: false, maxAmount: this.getMaxAmount(tokenInfo),
      })

      this.props.updateAmount(new BigNumber(amount))
    }
    this.props.onClose();
  }

  getMaxAmount = (tokenInfo) => {
    const token = this.state.fullTokensList.find(
      entry => entry.info.Identifier === tokenInfo.Identifier
    )

    if (!token) throw new Error('Token not found.')

    return token.amount
  }

  isValidAmount = (tokenInfo) => {
    const token = this.state.selectedTokens.find(
      ({ tokenInfo: t }) => t.Identifier === tokenInfo.Identifier
    )

    if (token) {
      const maxAmount = new BigNumber(this.getMaxAmount(tokenInfo))
      if (maxAmount.lt(token.amount || 0) || token.amount < 0) {
        return false
      }
    }
    return true
  }

  isValidAmounts = () => {
    for (const tokenEntry of this.state.selectedTokens) {
      if (
        !this.isValidAmount(tokenEntry.tokenInfo) ||
        !tokenEntry.amount
      ) return false;
    }
    return true
  }

  search: ((e: SyntheticEvent<HTMLInputElement>) => void) =
    (event: SyntheticEvent<HTMLInputElement>) => {
      const keyword = event.currentTarget.value
      this.setState((prev) => ({ currentTokensList: prev.fullTokensList }))
      if(!keyword) return
      const regExp = new RegExp(keyword, 'gi')
      const tokensListCopy = [...this.state.fullTokensList]
      const filteredTokensList = tokensListCopy.filter(a => a.label.match(regExp))
      this.setState({ currentTokensList: filteredTokensList })
    };

    compare: ((a: any, b: any, field: string) => number) = ( a, b, field ) => {
      let newSortDirection = SORTING_DIRECTIONS.UP
      if (!this.state.sortingDirection) {
        newSortDirection = SORTING_DIRECTIONS.UP
      } else if (this.state.sortingDirection === SORTING_DIRECTIONS.UP) {
        newSortDirection = SORTING_DIRECTIONS.DOWN
      }

      this.setState({ sortingDirection: newSortDirection })

      if (field === 'amount') {
        return compareNumbers(a[field], b[field], newSortDirection)
      }
      // Other fields
      return compareStrings(a[field], b[field], newSortDirection)
    }

  sortTokens: ((field: string) => void) = (field: string) => {
    const tokensListCopy = [...this.state.fullTokensList]
    const sortedTokens = tokensListCopy.sort((a,b) => this.compare(a,b, field))
    this.setState({ currentTokensList: sortedTokens, sortingColumn: field });
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

  renderMinAda(): string {
    const { totalInput, fee, isCalculatingFee } = this.props
    if (isCalculatingFee) return '...';
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
    if (!totalInput || !fee) return '0.0';
    const amount = totalInput.joinSubtractCopy(fee);
    return formatValue(amount.getDefaultEntry());
  }

  render(): Node {
    const { intl } = this.context;
    const {
      onClose,
      totalInput,
      fee,
      isCalculatingFee,
      getTokenInfo,
      maxAssetsAllowed,
      numOfTokensIncluded
    } = this.props;
    const { currentTokensList, fullTokensList, selectedTokens } = this.state;
    const shouldAddMoreAssets = numOfTokensIncluded + selectedTokens.length <= maxAssetsAllowed
    return (
      <Dialog
        title={
          fullTokensList.length === 0 ? intl.formatMessage(globalMessages.tokens) :
            intl.formatMessage(messages.nTokens, { number: fullTokensList.length })
        }
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
          {isCardanoHaskell(this.props.selectedNetwork) && (
          <div className={styles.minAda}>
            <MinAda
              totalInput={totalInput}
              fee={fee}
              isCalculatingFee={isCalculatingFee}
              getTokenInfo={getTokenInfo}
            />
          </div>
          )}
          {!shouldAddMoreAssets && (
            <Box sx={{ marginTop: '10px' }}>
              <MaxAssetsError />
            </Box>)}
          {
            currentTokensList.length === 0 ? (
              <div className={styles.noAssetFound}>
                <NoItemsFoundImg />
                <h1 className={styles.text}>
                  {intl.formatMessage(
                    fullTokensList.length === 0 ? messages.noTokensYet : messages.noAssetFound
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
                  currentTokensList.map(token => (
                    <SingleTokenRow
                      key={token.id}
                      token={token}
                      classicTheme={this.props.classicTheme}
                      updateAmount={this.updateAmount}
                      getTokenAmount={this.getCurrentAmount}
                      uriParams={this.props.uriParams}
                      selectedToken={this.props.selectedToken}
                      validateAmount={this.props.validateAmount}
                      defaultToken={this.props.defaultToken}
                      getTokenInfo={this.props.getTokenInfo}
                      onAddToken={this.onSelect}
                      onRemoveToken={this.onRemoveToken}
                      fee={this.props.fee}
                      error={this.props.error}
                      isCalculatingFee={this.props.isCalculatingFee}
                      totalInput={this.props.totalInput}
                      isTokenIncluded={this.isTokenIncluded}
                      isValidAmount={this.isValidAmount}
                    />
                  ))
                }
              </div>
            )
          }

        </div>
        {fullTokensList.length !== 0 && (
          <Button
            sx={{
              width: '100%',
              height: '61px',
              borderRadius: '0px',
              color: 'var(--yoroi-palette-secondary-300)',
            }}
            disabled={selectedTokens.length === 0 || !this.isValidAmounts() || !shouldAddMoreAssets}
            onClick={this.onAddAll}
            variant='ternary'
          >
            {intl.formatMessage(messages.add)}
          </Button>
        )}
      </Dialog>
    );
  }
}
