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
import { ReactComponent as NoItemsFoundImg } from '../../../../assets/images/assets-page/no-tokens.inline.svg'
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
import MinAda from './MinAda';
import globalMessages from '../../../../i18n/global-messages';
import MaxAssetsError from '../MaxAssetsError';
import { Box } from '@mui/system';
import OutlinedInput from '@mui/material/OutlinedInput';
import { formattedAmountToNaturalUnits } from '../../../../utils/formatters';

type Props = {|
  +onClose: void => void,
  +spendableBalance: ?MultiToken,
  +classicTheme: boolean,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +updateAmount: (?BigNumber) => void,
  +uriParams: ?UriParams,
  +selectedToken: void | $ReadOnly<TokenRow>,
  +defaultToken: $ReadOnly<TokenRow>,
  +error: ?LocalizableError,
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +isTokenIncluded: ($ReadOnly<TokenRow>) => boolean,
  +onAddToken: ({|
    token: void | $ReadOnly<TokenRow>,
    shouldReset?: boolean,
  |}) => void,
  +onRemoveToken: (void | $ReadOnly<TokenRow>) => void,
  +getTokenAmount: ($ReadOnly<TokenRow>) => ?string,
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
  noTokensFound: {
    id: 'wallet.send.form.dialog.noTokensFound',
    defaultMessage: '!!!No tokens found',
  },
  noTokensYet: {
    id: 'wallet.send.form.dialog.noTokensYet',
    defaultMessage: '!!!There are no tokens in your wallet yet'
  },
  add: {
    id: 'wallet.send.form.dialog.add',
    defaultMessage: '!!!add'
  },
  minAda: {
    id: 'wallet.send.form.dialog.minAda',
    defaultMessage: '!!!Min-ADA: {minAda}'
},
});

@observer
export default class AddTokenDialog extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    currentTokensList: [],
    fullTokensList: [],
    sortingDirection: null,
    sortingColumn: '',
    selectedTokens: [],
  };

  componentDidMount(): void {
    const { spendableBalance, getTokenInfo, plannedTxInfoMap } = this.props;
    const tokensList = getTokens(spendableBalance, getTokenInfo)
    const selectedTokens = plannedTxInfoMap.filter(({ token }) => !token.IsNFT && !token.IsDefault)
      .map(({ token, amount }) => ({ token, amount, included: true }));

    this.setState({ currentTokensList: tokensList, fullTokensList: tokensList, selectedTokens })
  }


  onSelect: $ReadOnly<TokenRow> => void = (token) => {
    // Remove if it already in the list
    const selectedTokens = this.state.selectedTokens.filter(
      ({ token: t }) => t.Identifier !== token.Identifier
    );
    this.setState({ selectedTokens: [...selectedTokens, { token, included: true }] });
  }

  onRemoveToken = (token) => {
    const tokenEntry = this.getSelectedToken(token);
    if (!tokenEntry) return;
    const selectedTokens = [...this.state.selectedTokens].filter(
      ({ token: t }) => t.Identifier !== token.Identifier);

    this.setState({
      selectedTokens: [...selectedTokens, { token, included: false, amount: null }]
    });
  }

  isTokenIncluded = (token) => {
    return !!this.state.selectedTokens.find(
      ({ token: t }) => t.Identifier === token?.Identifier
    )?.included;
  }

  updateAmount = (token, amount) => {
    const tokenEntry = this.state.selectedTokens.find(
      ({ token: t }) => t.Identifier === token.Identifier
    )

    const tokenEntryCopy = { ...tokenEntry };
    tokenEntryCopy.amount = amount;
    tokenEntryCopy.token = token;
    tokenEntryCopy.included = true;

    const filteredTokens = this.state.selectedTokens.filter(
      ({ token: t }) => t.Identifier !== token.Identifier
    );

    this.setState({ selectedTokens: [...filteredTokens, tokenEntryCopy] });
  }

  getCurrentAmount = (token) => {
    const tokenEntry = this.getSelectedToken(token);
    return tokenEntry?.amount;
  }

  getSelectedToken = (token) => {
    return this.state.selectedTokens.find(
      ({ token: t }) => t.Identifier === token.Identifier
    );
  }


  onAddAll = () => {
    for (const { token, amount, included } of this.state.selectedTokens) {
      if (!included) {
        this.props.onRemoveToken(token)
        continue
      }
      if (!amount) continue;
      this.props.onAddToken({
            token, shouldReset: false
      });

      this.props.updateAmount(amount);
    }
    this.props.onClose();
  }

  getMaxAmount = (tokenInfo) => {
    const token = this.state.fullTokensList.find(
      entry => entry.info.Identifier === tokenInfo.Identifier
    )

    if (!token) throw new Error('Token not found.')

    const amount = new BigNumber(formattedAmountToNaturalUnits(
      token.amount,
      token.info.Metadata.numberOfDecimals,
    ));
    return amount
  }

  isValidAmount = (token) => {
    const tokenEntry = this.state.selectedTokens.find(
      ({ token: t }) => t.Identifier === token.Identifier
    );
    if (tokenEntry && tokenEntry.included) {
      const maxAmount = this.getMaxAmount(token);
      if (maxAmount.lt(tokenEntry.amount || 0) || token.amount < 0) {
        return false
      }
    };
    return true
  }

  isValidAmounts = () => {
    for (const tokenEntry of this.state.selectedTokens) {
      if (!tokenEntry.included) continue;
      if (
        !this.isValidAmount(tokenEntry.token) ||
        !tokenEntry.amount ||
        Number(tokenEntry.amount) === 0
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

      const filteredTokensList = tokensListCopy.filter(
        a => a.label.match(regExp) || a.id.match(regExp)
      )
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

  render(): Node {
    const { intl } = this.context;
    const {
      onClose,
      maxAssetsAllowed,
      plannedTxInfoMap,
      calculateMinAda,
    } = this.props;
    const { currentTokensList, fullTokensList, selectedTokens } = this.state;
    const numOfTokensIncluded = plannedTxInfoMap.length;
    const shouldAddMoreAssets = numOfTokensIncluded + selectedTokens.length <= maxAssetsAllowed;
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
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box sx={{ position: 'absolute', top: '55%', left: '10px', transform: 'translateY(-50%)' }}> <SearchIcon /> </Box>
            <OutlinedInput
              onChange={this.search}
              sx={{ padding: '0px 0px 0px 30px', height: '40px', width: '100%', fontSize: '14px', lineHeight: '22px', }}
              placeholder={intl.formatMessage(messages.search)}
            />
          </Box>
          {isCardanoHaskell(this.props.selectedNetwork) && (
          <div className={styles.minAda}>
            <MinAda
              minAda={calculateMinAda(selectedTokens)}
            />
          </div>
          )}
          {!shouldAddMoreAssets && (
            <Box sx={{ marginTop: '10px' }}>
              <MaxAssetsError maxAssetsAllowed={10} />
            </Box>)}
          {
            currentTokensList.length === 0 ? (
              <div className={styles.noAssetFound}>
                <NoItemsFoundImg />
                <h1 className={styles.text}>
                  {intl.formatMessage(
                    fullTokensList.length === 0 ? messages.noTokensYet : messages.noTokensFound
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
                      defaultToken={this.props.defaultToken}
                      getTokenInfo={this.props.getTokenInfo}
                      onAddToken={this.onSelect}
                      onRemoveToken={this.onRemoveToken}
                      error={this.props.error}
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
