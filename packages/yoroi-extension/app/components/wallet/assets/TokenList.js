// @flow
import { useState } from 'react';
import type { ComponentType, Node } from 'react';
import { observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import styles from './AssetsList.scss';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import NoAssetLogo from '../../../assets/images/assets-page/asset-no.inline.svg';
import ArrowsListFromBottom from '../../../assets/images/assets-page/arrows-list-from-bottom.inline.svg';
import ArrowsListFromTop from '../../../assets/images/assets-page/arrows-list-from-top.inline.svg';
import ArrowsList from '../../../assets/images/assets-page/arrows-list.inline.svg';
import Search from '../../../assets/images/assets-page/search.inline.svg';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../utils/formatters';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import globalMessages from '../../../i18n/global-messages';
import { hiddenAmount } from '../../../utils/strings';
import { assetsMessage, compareNumbers, compareStrings } from './AssetsList';
import {
  Avatar,
  ButtonBase,
  Input,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Box, styled } from '@mui/system';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import CopyToClipboardText from '../../widgets/CopyToClipboardLabel';
import { ListEmpty } from './ListEmpty';

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
|};
type Props = {|
  +assetsList: Asset[],
  +assetDeposit: ?null | MultiToken,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +shouldHideBalance: boolean,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};
type State = {|
  assetsList: Asset[],
  sortingDirection: null | 'UP' | 'DOWN',
  sortingColumn: string,
|};

function TokenList({
  assetDeposit,
  getTokenInfo,
  assetsList: list,
  shouldHideBalance,
  intl,
}: Props & Intl): Node {
  const [state, setState] = useState<State>({
    assetsList: list,
    sortingDirection: null,
    sortingColumn: '',
  });

  const search: (e: SyntheticEvent<HTMLInputElement>) => void = (
    event: SyntheticEvent<HTMLInputElement>
  ) => {
    const keyword = event.currentTarget.value;
    const regExp = new RegExp(keyword, 'gi');
    const assetsListCopy = [...list];
    const filteredAssetsList = assetsListCopy.filter(a => a.name.match(regExp));
    setState(prev => ({ ...prev, assetsList: filteredAssetsList }));
  };

  const compare: (a: any, b: any, field: string) => number = (a, b, field) => {
    let newSortDirection = SORTING_DIRECTIONS.UP;
    if (!state.sortingDirection) {
      newSortDirection = SORTING_DIRECTIONS.UP;
    } else if (state.sortingDirection === SORTING_DIRECTIONS.UP) {
      newSortDirection = SORTING_DIRECTIONS.DOWN;
    }


    if (field === 'amount') {
      return compareNumbers(a[field], b[field], newSortDirection)
    }
    // Other fields
    return compareStrings(a[field], b[field], newSortDirection)
  };

  const sortAssets: (field: string) => void = (field: string) => {
    const assetsListCopy = [...state.assetsList];
    const sortedAssets = assetsListCopy.sort((a, b) => compare(a, b, field));
    setState(prev => ({ ...prev, assetsList: sortedAssets, sortingColumn: field }));
  };

  const displayColumnLogo: (column: string) => Node = (column: string) => {
    const { sortingColumn, sortingDirection } = state;
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

  const renderTokenName: () => Node = () => {
    if (assetDeposit == null) {
      return <div className={styles.isLoading} />;
    }
    const defaultEntry = assetDeposit.getDefaultEntry();
    const tokenInfo = getTokenInfo(defaultEntry);
    return truncateToken(getTokenName(tokenInfo));
  };

  const renderAmountDisplay: () => Node = () => {
    if (assetDeposit == null) {
      return <div className={styles.isLoading} />;
    }

    const defaultEntry = assetDeposit.getDefaultEntry();
    const tokenInfo = getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    let balanceDisplay;
    if (shouldHideBalance) {
      balanceDisplay = (
        <Typography as="span" fontWeight="inherit">
          {hiddenAmount}
        </Typography>
      );
    } else {
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
        shiftedAmount,
        tokenInfo.Metadata.numberOfDecimals
      );

      balanceDisplay = (
        <>
          <Typography as="span" fontWeight="inherit">
            {beforeDecimalRewards}
          </Typography>
          <Typography as="span" fontWeight="inherit">
            {afterDecimalRewards}
          </Typography>
        </>
      );
    }

    return (
      <>
        {balanceDisplay}
        <Typography as="span" ml="4px" fontWeight="inherit">
          {truncateToken(getTokenName(tokenInfo))}
        </Typography>
      </>
    );
  };

  const { assetsList } = state;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px solid var(--yoroi-palette-gray-200)"
        padding="16px 24px"
      >
        <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
          {intl.formatMessage(globalMessages.tokens)} ({list.length})
        </Typography>
        <SearchInput
          disableUnderline
          onChange={search}
          placeholder={intl.formatMessage(assetsMessage.search)}
          startAdornment={
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          }
        />
      </Box>

      {!assetsList.length ? (
        <ListEmpty message={intl.formatMessage(assetsMessage.noAssetFound)} />
      ) : (
        <>
          <List>
            <ListItemLayout
              firstColumn={
                <ButtonBase disableRipple onClick={() => sortAssets(SORTING_COLUMNS.NAME)}>
                  <Typography variant="body2" color="var(--yoroi-palette-gray-400)" mr="4px">
                    {intl.formatMessage(assetsMessage.nameAndTicker)}
                  </Typography>
                  {displayColumnLogo(SORTING_COLUMNS.NAME)}
                </ButtonBase>
              }
              secondColumn={
                <Typography variant="body2" color="var(--yoroi-palette-gray-400)">
                  {intl.formatMessage(globalMessages.fingerprint)}
                </Typography>
              }
              thirdColumn={
                <ButtonBase disableRipple onClick={() => sortAssets(SORTING_COLUMNS.AMOUNT)}>
                  <Typography variant="body2" color="var(--yoroi-palette-gray-400)" mr="4px">
                    {intl.formatMessage(assetsMessage.quantity)}
                  </Typography>
                  {displayColumnLogo(SORTING_COLUMNS.AMOUNT)}
                </ButtonBase>
              }
            />
            {assetDeposit ? (
              <TokenItemRow
                avatar={<NoAssetLogo />}
                name={renderTokenName()}
                id="-"
                amount={renderAmountDisplay()}
                isTotalAmount
              />
            ) : null}
            {assetsList.map(token => (
              <TokenItemRow
                key={token.id}
                avatar={<NoAssetLogo />}
                name={token.name}
                id={token.id}
                amount={token.amount}
              />
            ))}
          </List>
        </>
      )}
    </Box>
  );
}
export default (injectIntl(observer(TokenList)): ComponentType<Props>);

const SearchInput = styled(Input)({
  backgroundColor: 'var(--yoroi-palette-gray-50)',
  borderRadius: '8px',
  width: '370px',
  height: '40px',
  padding: '10px 12px',
});

function ListItemLayout({ firstColumn, secondColumn, thirdColumn }) {
  const layoutColumns = [
    {
      id: 1,
      content: firstColumn,
      width: '20%',
    },
    {
      id: 2,
      content: secondColumn,
      width: '45%',
    },
    {
      id: 3,
      content: thirdColumn,
      width: '35%',
    },
  ];
  return (
    <ListItem sx={{ px: '32px' }}>
      {layoutColumns.map(col => (
        <ListItemText
          key={col.id}
          sx={{
            flex: `1 1 ${col.width}`,
            maxWidth: col.width,
          }}
          primary={col.content}
        />
      ))}
    </ListItem>
  );
}

type TokenItemRowProps = {|
  avatar: Node,
  name: Node,
  id: string,
  amount: Node,
  isTotalAmount?: boolean,
|};
function TokenItemRow({ avatar, name, id, amount, isTotalAmount }: TokenItemRowProps): Node {
  return (
    <ListItemLayout
      firstColumn={
        <Box display="flex" alignItems="center">
          <Avatar variant="round" sx={{ background: 'white', marginRight: '16px' }}>
            {avatar}
          </Avatar>
          <Typography
            as={isTotalAmount !== false ? 'span' : Link}
            variant="body1"
            sx={{ textDecoration: 'none' }}
            color="var(--yoroi-palette-primary-300)"
            to={ROUTES.ASSETS.TOKEN_DETAILS.replace(':tokenId', id)}
          >
            {name}
          </Typography>
        </Box>
      }
      secondColumn={
        <Typography variant="body1" color="var(--yoroi-palette-gray-900)">
          <CopyToClipboardText text={id}>{truncateAddressShort(id)}</CopyToClipboardText>
        </Typography>
      }
      thirdColumn={<Typography fontWeight="500">{amount}</Typography>}
    />
  );
}
TokenItemRow.defaultProps = {
  isTotalAmount: false,
};
