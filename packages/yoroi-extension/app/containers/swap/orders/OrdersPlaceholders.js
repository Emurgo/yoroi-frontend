// @flow
import type { Node } from 'react';
import styles from './OrdersPage.scss';
import Table from '../../../components/common/table/Table';
import { Box } from '@mui/material';

type LoadingCompProps = {|
  columnLeftPaddings: Array<string>,
|};

export const LoadingOpenOrders = ({ columnLeftPaddings }: LoadingCompProps): Node => {
  const renderPlaceholderRow = () => (
    <>
      <Box width="100%" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="175px" height="24px" borderRadius="8px" />
      </Box>
      <Box width="100%" className={styles.fadeIn0} display="flex" justifyContent="flex-end">
        <Box bgcolor="ds.gray_c100" width="100px" alignSelf="right" height="24px" borderRadius="8px" />
      </Box>
      <Box width="100%" className={styles.fadeIn0} display="flex" justifyContent="flex-end">
        <Box bgcolor="ds.gray_c100" width="90px" height="24px" borderRadius="8px" />
      </Box>
      <Box width="100%" display="flex" flexDirection="column" gap="3px" alignItems="flex-end" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="75px" height="18px" borderRadius="8px" />
        <Box bgcolor="ds.gray_c100" width="75px" height="18px" borderRadius="8px" />
      </Box>
      <Box width="100%" display="flex" gap="5px" alignItems="center" justifyContent="center" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="32px" height="32px" borderRadius="50%" />
        <Box bgcolor="ds.gray_c100" width="125px" height="24px" borderRadius="8px" />
      </Box>
      <Box width="100%" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="130px" height="24px" borderRadius="8px" />
      </Box>
      <Box width="100%" display="flex" gap="5px" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="200px" height="24px" borderRadius="8px" />
        <Box bgcolor="ds.gray_c100" width="70px" height="24px" borderRadius="8px" />
      </Box>
    </>
  );
  return (
    <Box margin="0 24px" maxWidth="1820px">
      <Table
        columnKeys={[]}
        columnNames={[]}
        columnAlignment={['center']}
        columnLeftPaddings={columnLeftPaddings}
        gridTemplateColumns="176px 150px 166px 150px 216px 240px auto"
        columnGap="0px"
        columnRightPaddings={['0px', '0px', '0px', '0px', '0px', '0px', '0px']}
      >
        {renderPlaceholderRow()}
        {renderPlaceholderRow()}
        {renderPlaceholderRow()}
        {renderPlaceholderRow()}
        {renderPlaceholderRow()}
      </Table>
    </Box>
  );
};

export const LoadingCompletedOrders = ({ columnLeftPaddings }: LoadingCompProps): Node => {
  const renderPlaceholderRow = () => (
    <>
      <Box width="100%" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="200px" height="32px" borderRadius="8px" />
      </Box>
      <Box width="100%" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="150px" height="24px" borderRadius="8px" />
      </Box>
      <Box width="100%" />
      <Box width="100%" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="100px" height="24px" borderRadius="8px" />
      </Box>
      <Box width="100%" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="130px" height="24px" borderRadius="8px" />
      </Box>
      <Box width="100%" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="125px" height="24px" borderRadius="8px" />
      </Box>
      <Box width="100%" className={styles.fadeIn0}>
        <Box bgcolor="ds.gray_c100" width="225px" height="24px" borderRadius="8px" />
      </Box>
    </>
  );
  return (
    <Box margin="0 24px" maxWidth="1820px">
      <Table
        columnKeys={[]}
        columnNames={[]}
        columnAlignment={['center']}
        columnLeftPaddings={columnLeftPaddings}
        gridTemplateColumns="auto 150px auto auto 0px auto auto"
        columnGap="0px"
        rowGap="32px"
        columnRightPaddings={['0px', '0px', '0px', '0px', '0px', '0px', '0px']}
      >
        {renderPlaceholderRow()}
        {renderPlaceholderRow()}
        {renderPlaceholderRow()}
        {renderPlaceholderRow()}
        {renderPlaceholderRow()}
      </Table>
    </Box>
  );
};
