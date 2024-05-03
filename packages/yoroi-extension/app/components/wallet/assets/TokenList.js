// @flow
import { useState, useEffect } from 'react';
import type { ComponentType, Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { ReactComponent as DefaultAssetLogo } from '../../../assets/images/assets-page/default-asset-logo.inline.svg';
import { ReactComponent as ArrowsListFromBottom } from '../../../assets/images/assets-page/arrows-list-from-bottom.inline.svg';
import { ReactComponent as ArrowsListFromTop } from '../../../assets/images/assets-page/arrows-list-from-top.inline.svg';
import { ReactComponent as ArrowsList } from '../../../assets/images/assets-page/arrows-list.inline.svg';
import { ReactComponent as Search } from '../../../assets/images/assets-page/search.inline.svg';
import { truncateAddressShort } from '../../../utils/formatters';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import globalMessages from '../../../i18n/global-messages';
import { hiddenAmount } from '../../../utils/strings';
import { assetsMessage, compareNumbers, compareStrings } from './AssetsList';
import {
  ButtonBase,
  Input,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Box, styled } from '@mui/system';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import CopyToClipboardLabel from '../../widgets/CopyToClipboardLabel';
import { ListEmpty } from './ListEmpty';
import BigNumber from 'bignumber.js';

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
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type State = {|
  assetsList: Asset[],
  sortingDirection: null | 'UP' | 'DOWN',
  sortingColumn: string,
|};

const messages: Object = defineMessages({
  search: {
    id: 'wallet.revamp.assets.search',
    defaultMessage: '!!!Search by asset name or ID',
  },
});

function TokenList({ assetsList: list, shouldHideBalance, intl }: Props & Intl): Node {
  const [state, setState] = useState<State>({
    assetsList: list,
    sortingDirection: null,
    sortingColumn: '',
  });
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const regExp = new RegExp(keyword, 'gi');
    const assetsListCopy = [...list];
    const filteredAssetsList = assetsListCopy.filter(a =>
      [a.name, a.id].some(field => field.match(regExp))
    );
    setState(prev => ({ ...prev, assetsList: filteredAssetsList }));
  }, [keyword, list]);

  const compare: (a: any, b: any, field: string) => number = (a, b, field) => {
    let newSortDirection = SORTING_DIRECTIONS.UP;
    if (!state.sortingDirection) {
      newSortDirection = SORTING_DIRECTIONS.UP;
    } else if (state.sortingDirection === SORTING_DIRECTIONS.UP) {
      newSortDirection = SORTING_DIRECTIONS.DOWN;
    }

    setState({ ...state, sortingDirection: newSortDirection });

    if (field === SORTING_COLUMNS.AMOUNT) {
      const dedicatedField = 'amountForSorting';
      if (a[dedicatedField] != null && b[dedicatedField] != null) {
        return compareNumbers(a[dedicatedField], b[dedicatedField], newSortDirection);
      }
      return compareNumbers(a[field], b[field], newSortDirection);
    }
    // Other fields
    return compareStrings(a[field], b[field], newSortDirection);
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

  const { assetsList } = state;

  return (
    <Stack sx={{ minHeight: '500px' }} id="tokens-list">
      <Box display="flex" justifyContent="space-between" alignItems="center" paddingBottom="8px">
        <Typography component="div"
          variant="h5"
          color="var(--yoroi-palette-common-black)"
          fontWeight={500}
          fontSize="18px"
        >
          {intl.formatMessage(assetsMessage.assets, {
            number: list.length,
          })}
        </Typography>
        <SearchInput
          disableUnderline
          onChange={e => setKeyword(e.target.value)}
          placeholder={intl.formatMessage(messages.search)}
          sx={{
            bgcolor: 'ds.gray_cmin',
            border: '1px solid',
            borderColor: 'ds.gray_c400',
            'input::placeholder': {
              color: 'ds.gray_c600',
            },
          }}
          startAdornment={
            <InputAdornment
              sx={{
                '> svg > use': {
                  fill: 'ds.gray_c600',
                },
              }}
              position="start"
            >
              <Search />
            </InputAdornment>
          }
        />
      </Box>

      {!assetsList.length ? (
        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', flex: 1 }}>
          <ListEmpty message={intl.formatMessage(assetsMessage.noAssetFound)} />
        </Stack>
      ) : (
        <>
          <List>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'ds.gray_c200', mt: '-8px' }}>
              <ListItemLayout
                firstColumn={
                  <ButtonBase disableRipple onClick={() => sortAssets(SORTING_COLUMNS.NAME)}>
                    <Typography component="div" variant="body2" color="ds.gray_c600" mr="4px">
                      {intl.formatMessage(assetsMessage.nameAndTicker)}
                    </Typography>
                    {displayColumnLogo(SORTING_COLUMNS.NAME)}
                  </ButtonBase>
                }
                secondColumn={
                  <Stack direction="row" alignItems="center" spacing="4px">
                    <Typography component="div" variant="body2" color="ds.gray_c600">
                      {intl.formatMessage(globalMessages.fingerprint)}
                    </Typography>
                  </Stack>
                }
                thirdColumn={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <ButtonBase disableRipple onClick={() => sortAssets(SORTING_COLUMNS.AMOUNT)}>
                      <Typography component="div" variant="body2" color="ds.gray_c600" mr="4px">
                        {intl.formatMessage(assetsMessage.quantity)}
                      </Typography>
                      {displayColumnLogo(SORTING_COLUMNS.AMOUNT)}
                    </ButtonBase>
                  </Box>
                }
              />
            </Box>

            {assetsList.map(token => (
              <TokenItemRow
                key={token.id}
                avatar={<DefaultAssetLogo />}
                name={token.name || '-'}
                id={token.id}
                amount={shouldHideBalance ? hiddenAmount : token.amount}
              />
            ))}
          </List>
        </>
      )}
    </Stack>
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
      width: '25%',
    },
    {
      id: 2,
      content: secondColumn,
      width: '40%',
    },
    {
      id: 3,
      content: thirdColumn,
      width: '35%',
    },
  ];
  return (
    <ListItem sx={{ px: '0' }}>
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
  const below1200px = useMediaQuery('(max-width: 1200px)');
  return (
    <ListItemLayout
      firstColumn={
        <Box display="flex" alignItems="center">
          <Box sx={{ mr: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatar}
          </Box>
          <Typography
            as={isTotalAmount !== false ? 'span' : Link}
            variant="body1"
            sx={{
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '70%',
            }}
            color="ds.primary_c600"
            to={id === '-' ? '#' :  ROUTES.ASSETS.DETAILS.replace(':tokenId', id)}
          >
            {name}
          </Typography>
        </Box>
      }
      secondColumn={
        <Typography component="div" variant="body1" color="ds.gray_c900">
          <Box sx={{ '> button': { px: '5px', py: '3px', borderRadius: '8px', ml: '-5px' } }}>
            <CopyToClipboardLabel text={id}>
              {below1200px ? truncateAddressShort(id) : id}
            </CopyToClipboardLabel>
          </Box>
        </Typography>
      }
      thirdColumn={
        <Typography component="div" fontWeight="500" textAlign="right">
          {amount}
        </Typography>
      }
    />
  );
}
TokenItemRow.defaultProps = {
  isTotalAmount: false,
};
