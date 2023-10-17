import { Fragment, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog';
import Table from '../common/table/Table';

const tableColumns = ['DEX name', 'Asset price', 'Liquidity', 'DEX fee. %', 'Deposit. ADA'];

const templateColumns = 'minmax(auto, 208px) 120px 200px 96px 136px';

export default function SelectPoolDialog({ currentPool, poolList = [], onPoolSelected, onClose }) {
  const handlePoolSelected = pool => {
    onPoolSelected(pool);
    onClose();
  };

  return (
    <Dialog title={'Select dex'} onClose={onClose} closeOnOverlayClick>
      <Table gridTemplateColumns={templateColumns} columnNames={tableColumns}>
        {poolList.map(pool => {
          const { image, name, price, liquidity, fee, deposit } = pool;
          return (
            <Box
              key={name}
              onClick={() => handlePoolSelected(pool)}
              sx={{
                p: '8px',
                display: 'grid',
                gridColumn: '1/-1',
                border: '1px solid',
                borderRadius: '8px',
                cursor: 'pointer',
                borderColor: currentPool === name ? 'primary.600' : 'transparent',
                gridTemplateColumns: templateColumns,
                '&:hover': { bgcolor: 'grayscale.50' },
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <Box>{image}</Box>
                <Typography component="span" variant="body1" fontWeight={500}>
                  {name}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {price} ADA
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {liquidity}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {fee}%
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {deposit}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Table>
    </Dialog>
  );
}
