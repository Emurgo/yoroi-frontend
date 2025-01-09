

import { Stack, TableCell, TableRow } from '@mui/material';
import React from 'react';
import { Skeleton } from '../../../../components';


export const TableRowSkeleton = ({ theme, ...props }) => (
    <TableRow
        {...props}
        sx={{
            '& td': { border: 0 },
        }}
    >
        <TableCell>
            <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
                <Skeleton width="40px" height="40px" />
                <Stack direction="column" spacing={theme.spacing(0.25)}>
                    <Skeleton width="55px" height="24px" />
                    <Skeleton width="55px" height="16px" />
                </Stack>
            </Stack>
        </TableCell>

        <TableCell>
            <Skeleton width="126px" height="24px" />
        </TableCell>

        <TableCell>
            <Skeleton width="62px" height="20px" />
        </TableCell>

        <TableCell>
            <Skeleton width="62px" height="20px" />
        </TableCell>

        <TableCell>
            <Skeleton width="62px" height="20px" />
        </TableCell>

        <TableCell>
            <Skeleton width="146px" height="24px" />
        </TableCell>

        <TableCell>
            <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
                <Stack direction="column" spacing={theme.spacing(0.25)}>
                    <Skeleton width="146px" height="24px" />
                    <Skeleton width="146px" height="16px" />
                </Stack>
            </Stack>
        </TableCell>
    </TableRow>
);
