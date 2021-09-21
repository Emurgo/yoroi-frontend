// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';

import { defineMessages, intlShape } from 'react-intl';
import styles from './AssetsList.scss'
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import NoAssetLogo from '../../../assets/images/assets-page/asset-no.inline.svg';
import ArrowsListFromBottom from '../../../assets/images/assets-page/arrows-list-from-bottom.inline.svg';
import ArrowsListFromTop from '../../../assets/images/assets-page/arrows-list-from-top.inline.svg';
import ArrowsList from '../../../assets/images/assets-page/arrows-list.inline.svg';
import Info from '../../../assets/images/assets-page/info.inline.svg';
import Search from '../../../assets/images/assets-page/search.inline.svg';
import { truncateAddressShort } from '../../../utils/formatters';
import BorderedBox from '../../widgets/BorderedBox';

const SORTING_DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN'
}

const SORTING_COLUMNS = {
  NAME: 'name',
  AMOUNT: 'amount'
}

 export type Asset = {|
  name: string,
  id: string,
  amount: string,
|}
type Props = {|
  +assetsList: Asset[],
|};

type State = {|
  assetsList: Asset[],
  sortingDirection: null | 'UP' | 'DOWN',
  sortingColumn: string
|}

const messages = defineMessages({
  assets: {
    id: 'wallet.assets.assets',
    defaultMessage: '!!!Assets ({number})',
  },
  nameAndTicker: {
    id: 'wallet.assets.nameAndTicker',
    defaultMessage: '!!!Name and ticker',
  },
  quantity: {
    id: 'wallet.assets.quantity',
    defaultMessage: '!!!Quantity',
  },
  subject: {
    id: 'wallet.assets.subject',
    defaultMessage: '!!!Subject',
  },
  search: {
    id: 'wallet.assets.search',
    defaultMessage: '!!!Search',
  },
  noAssetFound: {
    id: 'wallet.assets.noAssetFound',
    defaultMessage: '!!!No Asset Found',
  },
});
@observer
export default class AssetsList extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    assetsList: [...this.props.assetsList],
    sortingDirection: null,
    sortingColumn: '',
  };

  search: ((e: SyntheticEvent<HTMLInputElement>) => void) = (event: SyntheticEvent<HTMLInputElement>) => {
    const keyword = event.currentTarget.value
    this.setState({ assetsList: this.props.assetsList })
    if(!keyword) return
    const regExp = new RegExp(keyword, 'gi')
    const assetsListCopy = [...this.props.assetsList]
    const filteredAssetsList = assetsListCopy.filter(a => a.name.match(regExp))
    this.setState({ assetsList: filteredAssetsList })
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

  sortAssets: ((field: string) => void) = (field: string) => {
    const assetsListCopy = [...this.state.assetsList]
    const sortedAssets = assetsListCopy.sort((a,b) => this.compare(a,b, field))
    this.setState({ assetsList: sortedAssets, sortingColumn: field });
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
    const { assetsList } = this.state
    return (
      <div className={styles.component}>
        <BorderedBox>
          <div className={styles.header}>
            <h1 className={styles.assets}>
              {intl.formatMessage(messages.assets, { number: this.props.assetsList.length })}
            </h1>
            <div className={styles.search}>
              <Search />
              <input onChange={this.search} type='text' placeholder={intl.formatMessage(messages.search)} />
            </div>
          </div>
        </BorderedBox>
        {
          assetsList.length === 0 ? (
            <div className={styles.noAssetFound}>
              <h1>{intl.formatMessage(messages.noAssetFound)}</h1>
            </div>
          ): (
            <>
              <ul className={styles.columns}>
                <li>
                  <button type='button' onClick={() => this.sortAssets(SORTING_COLUMNS.NAME)}>
                    <p className={styles.headerText}>
                      {intl.formatMessage(messages.nameAndTicker)}
                    </p>
                    {this.displayColumnLogo(SORTING_COLUMNS.NAME)}
                  </button>
                </li>
                <li>
                  <p className={styles.headerText}>
                    {intl.formatMessage(messages.subject)}
                  </p>
                  {/* <Info /> TODO: subject info? */}
                </li>
                <li>
                  <button type='button' onClick={() => this.sortAssets(SORTING_COLUMNS.AMOUNT)}>
                    <p className={styles.headerText}>
                      {intl.formatMessage(messages.quantity)}
                    </p>
                    {this.displayColumnLogo(SORTING_COLUMNS.AMOUNT)}
                  </button>
                </li>
              </ul>
              {assetsList.map(token => (
                <ul className={styles.row} key={token.id}>
                  <li className={styles.token}>
                    <div className={styles.logo}>
                      <NoAssetLogo />
                    </div>
                    <p>{token.name}</p>
                  </li>
                  <li>{truncateAddressShort(token.id)}</li>
                  <li className={styles.amount}>{token.amount}</li>
                </ul>
              ))}
            </>
          )
        }
      </div>
    );
  }
}