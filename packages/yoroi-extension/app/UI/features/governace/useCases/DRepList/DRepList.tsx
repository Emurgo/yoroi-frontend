import React from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { dRepToMaybeCredentialHex, dRepNormalize } from '../../../../../api/ada/lib/cardanoCrypto/utils';
import { useGovernanceDelegationToYoroiDrep } from '../../common/hooks/useGovernanceDelegationToYoroiDrep';
import { useStrings } from '../../common/hooks/useStrings';
import { SearchInput } from '../../../../components';
import { DrepDetailsSlide } from './DrepDetailsSlide';

// ── Types ───────────────────────────────────────────────────────────────────

type SortField = 'name' | 'stake' | 'registeredDate' | 'delegatorCount' | 'random';
type SortOrder = 'asc' | 'desc';

export interface DrepRow {
  id: string; // raw hex hash from API (used for matching currentDrepId)
  bech32Id: string; // CIP-129 bech32 (used for signing)
  name: string;
  stake: number;
  registeredDate: string | null;
  delegatorCount: number;
  imageUrl: string | null;
  twitterUrl: string | null;
  motivations: string | null;
  qualifications: string | null;
  references: Array<{ label: string | null; uri: string }>;
  metadataVerified: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getDrepName(drep: any): string {
  if (!drep.metadata?.givenName) return drep.id;
  const gn = drep.metadata.givenName;
  return typeof gn === 'string' ? gn : (gn['@value'] ?? drep.id);
}

function getTwitterUrl(drep: any): string | null {
  const refs: any[] = drep.metadata?.references ?? [];
  const ref = refs.find(r => r.uri?.['@value']?.includes('twitter.com') || r.uri?.['@value']?.includes('x.com'));
  return ref?.uri['@value'] ?? null;
}

function getMetadataText(value: any): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const en = value.find((v: any) => v['@language'] === 'en') ?? value[0];
    return en?.['@value'] ?? null;
  }
  return value['@value'] ?? null;
}

function getReferences(drep: any): Array<{ label: string | null; uri: string }> {
  const refs: any[] = drep.metadata?.references ?? [];
  return refs
    .map(r => ({ label: getMetadataText(r.label) ?? null, uri: r.uri?.['@value'] ?? r.uri ?? null }))
    .filter(r => r.uri != null);
}

function formatVotingPower(lovelace: number): string {
  const ada = lovelace / 1_000_000;
  if (ada >= 1_000_000_000) return `₳ ${(ada / 1_000_000_000).toFixed(2)}B`;
  if (ada >= 1_000_000) return `₳ ${(ada / 1_000_000).toFixed(2)}M`;
  if (ada >= 1_000) return `₳ ${(ada / 1_000).toFixed(2)}K`;
  return `₳ ${ada.toLocaleString()}`;
}

function formatRelativeDate(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const totalDays = Math.floor(ms / 86_400_000);
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (days > 0 && years === 0) parts.push(`${days}d`);
  return parts.length ? parts.join(' ') + ' ago' : 'today';
}

// ── Sort icon ────────────────────────────────────────────────────────────────

const SortIcon = ({ field, sortField, sortOrder }: { field: SortField; sortField: SortField; sortOrder: SortOrder }) => {
  const isActive = field === sortField;
  const asc = isActive && sortOrder === 'asc';
  const desc = isActive && sortOrder === 'desc';
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
        <path d="M4 0L7.46 4H0.54L4 0Z" fill={asc ? '#242838' : '#c4cad7'} />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
        <path d="M4 5L0.54 1H7.46L4 5Z" fill={desc ? '#242838' : '#c4cad7'} />
      </svg>
    </Box>
  );
};

const RandomSortIcon = ({ active }: { active: boolean }) => (
  <Box sx={{ display: 'flex', flexShrink: 0 }}>
    <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
      <path d="M4 5L0.54 1H7.46L4 5Z" fill={active ? '#242838' : '#c4cad7'} />
    </svg>
  </Box>
);

// ── Avatar ───────────────────────────────────────────────────────────────────

export const DrepAvatar = ({ imageUrl, name }: { imageUrl: string | null; name: string }) => {
  const theme: any = useTheme();
  if (imageUrl) {
    return (
      <Box
        component="img"
        src={imageUrl}
        alt={name}
        sx={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        onError={(e: any) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  return (
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: theme.palette.ds.gray_100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Typography variant="body2" color="ds.text_gray_low" fontWeight={500}>
        {name.slice(0, 2).toUpperCase()}
      </Typography>
    </Box>
  );
};

// ── Twitter icon ─────────────────────────────────────────────────────────────

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.75l7.73-8.835-8.156-10.665h6.07l4.259 5.633L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
      fill="#6b7384"
    />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

export const DRepList = () => {
  const { backendServiceZero, governanceStatus } = useGovernance();
  const currentDrepId = React.useMemo(() => {
    if (governanceStatus.status !== 'delegate' || !governanceStatus.drep) return null;
    const credHex = dRepToMaybeCredentialHex(governanceStatus.drep);
    // credHex has a 1-byte (2 hex char) kind prefix (22 = key, 23 = script); strip it to get the raw hash
    // then strip 3 bytes cbor header
    return credHex ? credHex.slice(8) : null;
  }, [governanceStatus.status, governanceStatus.drep]);
  const { delegateToDrep, loadingUnsignTx, error, setError } = useGovernanceDelegationToYoroiDrep();
  const strings = useStrings();

  const [dreps, setDreps] = React.useState<DrepRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchText, setSearchText] = React.useState('');
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');
  const [randomSeed, setRandomSeed] = React.useState(0);
  const [selectedDrep, setSelectedDrep] = React.useState<DrepRow | null>(null);

  React.useEffect(() => {
    if (!backendServiceZero) return;
    const PAGE_SIZE = 1000;
    const fetchAllDreps = async () => {
      const accumulated: any[] = [];
      let page = 1;
      while (true) {
        const res = await fetch(
          `https://yoroi-backend-zero-mainnet-staging.emurgornd.com/dreps/active?page=${page}&pageSize=${PAGE_SIZE}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: any[] = await res.json();
        accumulated.push(...data);
        if (data.length < PAGE_SIZE) break;
        page++;
      }
      return accumulated;
    };

    fetchAllDreps()
      .then(data => {
        const rows: DrepRow[] = data
          .filter(d => d.type === 'registered')
          .map(d => ({
            id: d.id,
            bech32Id: dRepNormalize(d.id, d.drepKind === 'scripthash' ? 'scripthash' : 'keyhash'),
            name: getDrepName(d),
            stake: d.stake ?? 0,
            registeredDate: d.registeredDate ?? null,
            delegatorCount: d.delegatorCount ?? 0,
            imageUrl: d.metadata?.image?.contentUrl ?? null,
            twitterUrl: getTwitterUrl(d),
            motivations: getMetadataText(d.metadata?.motivations),
            qualifications: getMetadataText(d.metadata?.qualifications),
            references: getReferences(d),
            // metadataStatus: 'valid' | 'invalid' | undefined — treat absent or 'valid' as verified
            metadataVerified: d.metadataStatus == null || d.metadataStatus === 'valid' || d.metadataStatus === 'verified',
          }));
        setDreps(rows);
      })
      .catch(err => console.error('[DRepList] fetch error', err))
      .finally(() => setLoading(false));
  }, [backendServiceZero]);

  const handleSortClick = (field: SortField) => {
    if (field === 'random') {
      setSortField('random');
      setRandomSeed(Math.random());
      return;
    }
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const displayed = React.useMemo(() => {
    const lower = searchText.toLowerCase();
    const filtered = lower
      ? dreps.filter(d => d.name.toLowerCase().includes(lower) || d.id.toLowerCase().includes(lower))
      : dreps;
    let sorted: DrepRow[];
    if (sortField === 'random') {
      // Seeded shuffle: hash each item's index with the seed for a stable order per seed value
      sorted = [...filtered].sort((a, b) => {
        const ha = Math.sin(filtered.indexOf(a) + randomSeed * 9301) * 49297;
        const hb = Math.sin(filtered.indexOf(b) + randomSeed * 9301) * 49297;
        return ha - hb;
      });
    } else {
      sorted = [...filtered].sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
          case 'name':
            cmp = a.name.localeCompare(b.name);
            break;
          case 'stake':
            cmp = a.stake - b.stake;
            break;
          case 'registeredDate':
            cmp = new Date(a.registeredDate ?? 0).getTime() - new Date(b.registeredDate ?? 0).getTime();
            break;
          case 'delegatorCount':
            cmp = a.delegatorCount - b.delegatorCount;
            break;
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
    }
    // Always pin the currently delegated drep to the top
    if (currentDrepId) {
      const idx = sorted.findIndex(d => d.id === currentDrepId);
      if (idx > 0) {
        const [current] = sorted.splice(idx, 1) as [DrepRow];
        sorted.unshift(current);
      }
    }
    return sorted;
  }, [dreps, searchText, sortField, sortOrder, randomSeed, currentDrepId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        {/* ── Header ── */}
        <TableHeader>
          <Typography variant="h5" color="ds.text_gray_medium">
            {strings.activeDrepsCount(dreps.length)}
          </Typography>
          <SearchInput placeholder={strings.searchDrep} value={searchText} onChange={e => setSearchText(e.target.value)} />
        </TableHeader>

        {/* ── Column Headers ── */}
        <ColumnHeaderRow>
          <ColHeaderCell width={304} onClick={() => handleSortClick('name')} sx={{ cursor: 'pointer' }}>
            <Typography variant="body2" color="ds.text_gray_low">
              {strings.drepColTickerAndName}
            </Typography>
            <SortIcon field="name" sortField={sortField} sortOrder={sortOrder} />
          </ColHeaderCell>
          <ColHeaderCell width={226} onClick={() => handleSortClick('stake')} sx={{ cursor: 'pointer' }}>
            <Typography variant="body2" color="ds.text_gray_low">
              {strings.drepColVotingPower}
            </Typography>
            <SortIcon field="stake" sortField={sortField} sortOrder={sortOrder} />
          </ColHeaderCell>
          <ColHeaderCell width={226} onClick={() => handleSortClick('registeredDate')} sx={{ cursor: 'pointer' }}>
            <Typography variant="body2" color="ds.text_gray_low">
              {strings.drepColRegistered}
            </Typography>
            <SortIcon field="registeredDate" sortField={sortField} sortOrder={sortOrder} />
          </ColHeaderCell>
          <ColHeaderCell width={226} onClick={() => handleSortClick('delegatorCount')} sx={{ cursor: 'pointer' }}>
            <Typography variant="body2" color="ds.text_gray_low">
              {strings.drepColDelegators}
            </Typography>
            <SortIcon field="delegatorCount" sortField={sortField} sortOrder={sortOrder} />
          </ColHeaderCell>
          <ColHeaderCell flex={1} onClick={() => handleSortClick('random')} sx={{ cursor: 'pointer' }}>
            <Typography variant="body2" color="ds.text_gray_low">
              {strings.drepColRandom}
            </Typography>
            <RandomSortIcon active={sortField === 'random'} />
          </ColHeaderCell>
        </ColumnHeaderRow>

        {/* ── Rows ── */}
        <RowsContainer>
          {displayed.map(drep => {
            const isCurrent = drep.id === currentDrepId;
            return (
              <DataRow
                key={drep.id}
                sx={
                  isCurrent
                    ? {
                        background: 'linear-gradient(180deg, #93f5e1 0%, #c6f7ed 100%)',
                        '&:hover': { background: 'linear-gradient(180deg, #93f5e1 0%, #c6f7ed 100%)' },
                      }
                    : {}
                }
              >
                {/* Ticker and name */}
                <DataCell width={304} sx={{ gap: '16px' }}>
                  <DrepAvatar imageUrl={drep.imageUrl} name={drep.name} />
                  <Stack gap="8px">
                    <Typography variant="body1" color="ds.text_primary_medium" sx={{ wordBreak: 'break-word' }}>
                      {drep.name}
                    </Typography>
                    {drep.twitterUrl && /^https:\/\//.test(drep.twitterUrl) && (
                      <Box
                        component="a"
                        href={drep.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <XIcon />
                      </Box>
                    )}
                  </Stack>
                </DataCell>

                {/* Voting power */}
                <DataCell width={226}>
                  <Typography variant="body1" color="ds.text_gray_medium">
                    {formatVotingPower(drep.stake)}
                  </Typography>
                </DataCell>

                {/* Registered */}
                <DataCell width={226}>
                  <Typography variant="body1" color="ds.text_gray_medium">
                    {drep.registeredDate ? formatRelativeDate(drep.registeredDate) : '—'}
                  </Typography>
                </DataCell>

                {/* Delegators */}
                <DataCell width={226} sx={{ gap: '8px' }}>
                  <PieChartIcon />
                  <Typography variant="body1" color="ds.text_gray_medium">
                    {drep.delegatorCount.toLocaleString()}
                  </Typography>
                </DataCell>

                {/* View details + Delegate (aligns with Random header) */}
                <DataCell flex={1} sx={{ gap: '8px' }}>
                  <ActionButton onClick={() => setSelectedDrep(drep)}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="ds.text_gray_medium"
                      sx={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}
                    >
                      {strings.viewDetails}
                    </Typography>
                  </ActionButton>
                  <ActionButton
                    onClick={() => { setSelectedDrep(drep); delegateToDrep(drep.bech32Id); }}
                    sx={{
                      pointerEvents: isCurrent || loadingUnsignTx ? 'none' : undefined,
                      opacity: isCurrent || loadingUnsignTx ? 0.5 : 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        color: isCurrent ? '#a0b3f2' : 'ds.text_primary_medium',
                      }}
                    >
                      {strings.delegateLabel}
                    </Typography>
                  </ActionButton>
                </DataCell>
              </DataRow>
            );
          })}

          {displayed.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <Typography variant="body1" color="ds.text_gray_low">
                {strings.noDrepsFound}
              </Typography>
            </Box>
          )}
        </RowsContainer>
      </TableContainer>

      <DrepDetailsSlide
        drep={selectedDrep}
        onClose={() => { setSelectedDrep(null); setError(null); }}
        onDelegate={() => { if (selectedDrep) delegateToDrep(selectedDrep.bech32Id); }}
        isCurrentDrep={selectedDrep?.id === currentDrepId}
        delegateDisabled={loadingUnsignTx}
        error={selectedDrep != null ? error : null}
      />
    </>
  );
};

// ── Pie chart icon (inline SVG) ───────────────────────────────────────────────

const PieChartIcon = () => (
  <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2a8 8 0 1 0 8 8h-8V2Z" fill="#6b7384" opacity="0.5" />
      <path d="M12 2.26A8.004 8.004 0 0 1 18 10h-6V2.26Z" fill="#6b7384" />
    </svg>
  </Box>
);

// ── Styled components ─────────────────────────────────────────────────────────

const TableContainer = styled(Box)(({ theme }: any) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  flex: 1,
  minHeight: 0,
  borderRadius: '8px',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.ds.gray_200}`,
}));

const RowsContainer = styled(Box)(() => ({
  overflowY: 'auto',
  flex: 1,
  minHeight: 0,
}));

const TableHeader = styled(Box)(({ theme }: any) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  borderBottom: `1px solid ${theme.palette.ds.gray_200}`,
}));

const ColumnHeaderRow = styled(Box)(({ theme }: any) => ({
  display: 'flex',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.ds.gray_200}`,
  background: theme.palette.ds.bg_color_max,
}));

const ColHeaderCell = styled(Box)<{ width?: number; flex?: number }>(({ width, flex }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '16px',
  width: width ? `${width}px` : undefined,
  flex: flex ?? 'none',
  flexShrink: 0,
}));

const DataRow = styled(Box)(({ theme }: any) => ({
  display: 'flex',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.ds.gray_200}`,
  background: theme.palette.ds.bg_color_max,
  '&:last-of-type': {
    borderBottom: 'none',
  },
  '&:hover': {
    background: theme.palette.ds.gray_50 ?? theme.palette.ds.gray_100,
  },
}));

const DataCell = styled(Box)<{ width?: number; flex?: number }>(({ width, flex }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  width: width ? `${width}px` : undefined,
  flex: flex ?? 'none',
  flexShrink: 0,
  alignSelf: 'stretch',
}));

const ActionButton = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '9px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(0,0,0,0.04)',
  },
})) as typeof Box;
