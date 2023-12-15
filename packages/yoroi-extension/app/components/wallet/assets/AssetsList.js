// @flow
import type { Node } from 'react';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';
import { defineMessages, intlShape } from 'react-intl';
import styles from './AssetsList.scss';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as NoAssetLogo } from '../../../assets/images/assets-page/asset-no.inline.svg';
import { ReactComponent as ArrowsListFromBottom } from '../../../assets/images/assets-page/arrows-list-from-bottom.inline.svg';
import { ReactComponent as ArrowsListFromTop } from '../../../assets/images/assets-page/arrows-list-from-top.inline.svg';
import { ReactComponent as ArrowsList } from '../../../assets/images/assets-page/arrows-list.inline.svg';
import { ReactComponent as Search } from '../../../assets/images/assets-page/search.inline.svg';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../utils/formatters';
import BorderedBox from '../../widgets/BorderedBox';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow, NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import globalMessages from '../../../i18n/global-messages';
import { hiddenAmount } from '../../../utils/strings';
import OpenInExplorer from '../../widgets/OpenInExplorer';

const SORTING_DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN',
};

const SORTING_COLUMNS = {
  NAME: 'name',
  AMOUNT: 'amount',
};

export type Asset = {|
  name: string,
  id: string,
  amount: string,
  amountForSorting?: BigNumber,
|};
type Props = {|
  +assetsList: Asset[],
  +assetDeposit: ?null | MultiToken,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +shouldHideBalance: boolean,
  +network: $ReadOnly<NetworkRow>,
|};

type State = {|
  assetsList: Asset[],
  sortingDirection: null | 'UP' | 'DOWN',
  sortingColumn: string,
|};

export const assetsMessage: Object = defineMessages({
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
  identifier: {
    id: 'wallet.assets.id',
    defaultMessage: '!!!ID',
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

export function compareStrings(x: string, y: string, newSortDirection: string): number {
  if (x < y) {
    return newSortDirection === SORTING_DIRECTIONS.UP ? -1 : 1;
  }
  if (x > y) {
    return newSortDirection === SORTING_DIRECTIONS.UP ? 1 : -1;
  }
  return 0;
}

export function compareNumbers(x: string, y: string, newSortDirection: string): number {
  const first = new BigNumber(x);
  const second = new BigNumber(y);
  const res = first.comparedTo(second);
  if (res === -1) {
    // first < second
    return newSortDirection === SORTING_DIRECTIONS.UP ? -1 : 1;
  }
  if (res === 1) {
    // first > second
    return newSortDirection === SORTING_DIRECTIONS.UP ? 1 : -1;
  }
  return 0;
}
@observer
export default class AssetsList extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    assetsList: [...this.props.assetsList],
    sortingDirection: null,
    sortingColumn: '',
  };

  search: (e: SyntheticEvent<HTMLInputElement>) => void = (
    event: SyntheticEvent<HTMLInputElement>
  ) => {
    const keyword = event.currentTarget.value;
    this.setState({ assetsList: this.props.assetsList });
    if (!keyword) return;
    const regExp = new RegExp(keyword, 'gi');
    const assetsListCopy = [...this.props.assetsList];
    const filteredAssetsList = assetsListCopy.filter(a => a.name.match(regExp));
    this.setState({ assetsList: filteredAssetsList });
  };

  compare: (a: any, b: any, field: string) => number = (a, b, field) => {
    let newSortDirection = SORTING_DIRECTIONS.UP;
    if (!this.state.sortingDirection) {
      newSortDirection = SORTING_DIRECTIONS.UP;
    } else if (this.state.sortingDirection === SORTING_DIRECTIONS.UP) {
      newSortDirection = SORTING_DIRECTIONS.DOWN;
    }

    this.setState({ sortingDirection: newSortDirection });

    if (field === 'amount') {
      const dedicatedField = 'amountForSorting';
      if (a[dedicatedField] != null && b[dedicatedField] != null) {
        return compareNumbers(a[dedicatedField], b[dedicatedField], newSortDirection);
      }
      return compareNumbers(a[field], b[field], newSortDirection);
    }
    // Other fields
    return compareStrings(a[field], b[field], newSortDirection);
  };

  sortAssets: (field: string) => void = (field: string) => {
    const assetsListCopy = [...this.state.assetsList];
    const sortedAssets = assetsListCopy.sort((a, b) => this.compare(a, b, field));
    this.setState({ assetsList: sortedAssets, sortingColumn: field });
  };

  displayColumnLogo: (column: string) => Node = (column: string) => {
    const { sortingColumn, sortingDirection } = this.state;
    if (!sortingDirection || sortingColumn !== column) {
      return <ArrowsList />;
    }
    if (sortingDirection === SORTING_DIRECTIONS.UP && sortingColumn === column) {
      return <ArrowsListFromTop />;
    }
    if (sortingDirection === SORTING_DIRECTIONS.DOWN && sortingColumn === column) {
      return <ArrowsListFromBottom />;
    }
    return <ArrowsList />;
  };

  renderAmountDisplay: () => Node = () => {
    if (this.props.assetDeposit == null) {
      return <div className={styles.isLoading} />;
    }

    const defaultEntry = this.props.assetDeposit.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    let balanceDisplay;
    if (this.props.shouldHideBalance) {
      balanceDisplay = <span>{hiddenAmount}</span>;
    } else {
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
        shiftedAmount,
        tokenInfo.Metadata.numberOfDecimals
      );

      balanceDisplay = (
        <>
          <span className={styles.beforeDecimal}>{beforeDecimalRewards}</span>
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
      );
    }

    return (
      <>
        {balanceDisplay}
        <span className={styles.tokenName}>{truncateToken(getTokenName(tokenInfo))}</span>
      </>
    );
  };

  render(): Node {
    const { intl } = this.context;
    const { assetsList } = this.state;
    const { assetDeposit, network } = this.props;

    return (
      <div className={styles.component}>
        <BorderedBox>
          <div className={styles.header}>
            <h1 className={styles.assets}>
              {intl.formatMessage(assetsMessage.assets, { number: this.props.assetsList.length })}
            </h1>
            <div className={styles.search}>
              <Search />
              <input
                onChange={this.search}
                type="text"
                placeholder={intl.formatMessage(assetsMessage.search)}
              />
            </div>
          </div>
          {assetDeposit && (
            <div className={styles.lockedAssets}>
              <div className={styles.lockedAssetsAmount}>
                <div className={styles.label}>
                  {intl.formatMessage(globalMessages.assetDepositLabel)} &nbsp;
                </div>
                {this.renderAmountDisplay()}
              </div>
            </div>
          )}
        </BorderedBox>
        {assetsList.length === 0 ? (
          <div className={styles.noAssetFound}>
            <h1>{intl.formatMessage(assetsMessage.noAssetFound)}</h1>
          </div>
        ) : (
          <>
            <ul className={styles.columns}>
              <li>
                <button type="button" onClick={() => this.sortAssets(SORTING_COLUMNS.NAME)}>
                  <div className={styles.headerText}>
                    {intl.formatMessage(assetsMessage.nameAndTicker)}
                  </div>
                  {this.displayColumnLogo(SORTING_COLUMNS.NAME)}
                </button>
              </li>
              <li>
                <div className={styles.headerText}>{intl.formatMessage(assetsMessage.identifier)}</div>
                {/* <Info /> TODO: identifier info? */}
              </li>
              <li>
                <button type="button" onClick={() => this.sortAssets(SORTING_COLUMNS.AMOUNT)}>
                  <div className={styles.headerText}>{intl.formatMessage(assetsMessage.quantity)}</div>
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
                  <OpenInExplorer network={network} address={token.id}>
                    {token.name}
                  </OpenInExplorer>
                </li>
                <li>{truncateAddressShort(token.id)}</li>
                <li className={styles.amount}>{token.amount}</li>
              </ul>
            ))}
          </>
        )}
      </div>
    );
  }
}
