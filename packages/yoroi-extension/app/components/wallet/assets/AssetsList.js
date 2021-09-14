// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Input } from 'react-polymorph/lib/components/Input';

import { defineMessages, intlShape } from 'react-intl';
import styles from './AssetsList.scss'
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import { getTokenName, genFormatTokenAmount, getTokenStrictName, getTokenIdentifierIfExists, } from '../../../stores/stateless/tokenHelpers';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import NoAssetLogo from '../../../assets/images/assets-page/asset-no.inline.svg';
import ArrowsListFromBottom from '../../../assets/images/assets-page/arrows-list-from-bottom.inline.svg';
import ArrowsListFromTop from '../../../assets/images/assets-page/arrows-list-from-top.inline.svg';
import ArrowsList from '../../../assets/images/assets-page/arrows-list.inline.svg';
import Info from '../../../assets/images/assets-page/info.inline.svg';
import Search from '../../../assets/images/assets-page/search.inline.svg';
import { truncateAddressShort } from '../../../utils/formatters';
import BorderedBox from '../../widgets/BorderedBox';

const messages = defineMessages({});

const SORTING_DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN'
}

const SORTING_COLUMNS = {
  NAME: 'name',
  AMOUNT: 'amount'
}

/**
 * @todo
 * Add assetsList props
 */
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
    const filteredAssetsList = assetsListCopy.filter(a => regExp.test(a.name))
    this.setState({ assetsList: filteredAssetsList })
  };

  compare: ((a: any, b: any, field: string) => number) = ( a, b, field ) => {
    const newSortDirection = !this.state.sortingDirection 
        ? SORTING_DIRECTIONS.UP :
        this.state.sortingDirection === SORTING_DIRECTIONS.UP 
        ? SORTING_DIRECTIONS.DOWN :
          SORTING_DIRECTIONS.UP

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

    const sortedAssets = [...this.state.assetsList].sort((a,b) => this.compare(a,b, field))
    this.setState({ assetsList: sortedAssets, sortingColumn: field })
  };

  displayColumnLogo: ((column: string) => Node) = (column: string) => {
    const {
        sortingColumn,
        sortingDirection
    } = this.state
    return (!sortingDirection || sortingColumn !== column ?
        <ArrowsList />
        :sortingDirection === SORTING_DIRECTIONS.UP && sortingColumn === column ?
        <ArrowsListFromTop  />
        :sortingDirection === SORTING_DIRECTIONS.DOWN && sortingColumn === column &&
        <ArrowsListFromBottom /> )
}

  render(): Node {

    const { intl } = this.context;
    const { sortingColumn, sortingDirection, assetsList } = this.state
    return (
      <div className={styles.component}>
        <BorderedBox>
          <div className={styles.header}>
            <h1 className={styles.tokens}>Tokens ({this.props.assetsList.length})</h1>
            <div className={styles.search}>
              <Search />
              <input onChange={this.search} type='text' placeholder='Search' />
            </div>
          </div>
        </BorderedBox>
        <ul className={styles.columns}>
          <li onClick={() => this.sortAssets(SORTING_COLUMNS.NAME)}>
            <p className={styles.headerText}>Name and ticker</p>
            {this.displayColumnLogo(SORTING_COLUMNS.NAME)}
          </li>
          <li>
            <p className={styles.headerText}>Subject</p>
            <Info />
          </li>
          <li onClick={() => this.sortAssets(SORTING_COLUMNS.AMOUNT)}>
            <p className={styles.headerText}>Quantity</p>
            {this.displayColumnLogo(SORTING_COLUMNS.AMOUNT)}
          </li>
        </ul>
        {
          assetsList.map(token => (
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
          ))
        }
      </div>
    );
  }
}