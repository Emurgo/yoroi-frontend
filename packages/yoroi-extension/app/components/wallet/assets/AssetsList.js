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


/**
 * @todo
 * Add assetsList props
 */
type Props = {|
  +onClick: void => void,
  +assetsList: any,
|};

type State = {|
  assetsList: any,
|}

@observer
export default class AssetsList extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    assetsList: [...this.props.assetsList],
  }

  search: ((e: SyntheticEvent<HTMLInputElement>) => void) = (event: SyntheticEvent<HTMLInputElement>) => {
    const keyword = event.currentTarget.value
    this.setState({ assetsList: this.props.assetsList })
    if(!keyword) return
    const regExp = new RegExp(keyword, 'gi')
    const assetsListCopy = [...this.props.assetsList]
    const filteredAssetsList = assetsListCopy.filter(a => regExp.test(a.name))
    this.setState({ assetsList: filteredAssetsList })
  }

  render(): Node {

    const { intl } = this.context;

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
          <li>
            <p className={styles.headerText}>Name and ticker</p>
            <ArrowsList />
          </li>
          <li>
            <p className={styles.headerText}>Subject</p>
            <Info />
          </li>
          <li>
            <p className={styles.headerText}>Quantity</p>
            <ArrowsList />
          </li>
        </ul>
        {
          this.state.assetsList.map(token => (
            <ul className={styles.row} key={token.id} onClick={this.props.onClick}>
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