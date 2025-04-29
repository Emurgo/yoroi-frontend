import Typography from '@mui/material/Typography';
import * as React from 'react';

import { Box, Divider, Stack, styled } from '@mui/material';
import { Portfolio } from '@yoroi/types';
import BigNumber from 'bignumber.js';
import WalletAccountIcon from '../../../../../../components/topbar/WalletAccountIcon';
import { truncateAddress, truncateAddressShort, truncateLongName } from '../../../../../../utils/formatters';
import { Collapsible, Icon } from '../../../../../components';
import CopyableText from '../../../../../components/CopyableText';
import { Quantities } from '../../../../../utils/quantities';
import { useOperations } from '../../../common/operations';
import { useTxReviewModal } from '../../../module/ReviewTxProvider';
import { useStrings } from '../../../common/hooks/useStrings';
import { useWarningSection } from '../../../../../common/hooks/useWarningSection';

export interface SubMenuOption {
  label: string;
  route: string;
}

const IconWrapper = styled(Box)<{ receive: boolean }>(({ theme, receive }: any) => ({
  '& svg': {
    '& path': {
      fill: receive ? theme.palette.ds.secondary_400 : theme.palette.ds.el_primary_medium,
    },
  },
}));

const commonIdPath = 'txReview:overview';

export const OverviewTab = ({ receiverCustomTitle = null, tx }) => {
  const strings = useStrings();
  const {
    currentWalletDetails,
    changeModalView,
    stakingAddress,
    operations,
    extraOverviewDetails,
    isStakeRegistered,
    stakeKeyDeposit,
    primaryTokenInfo,
    drepID,
  } = useTxReviewModal();
  const { selected, selectedWalletName } = currentWalletDetails;
  const notOwnedOutputs = React.useMemo(() => tx.outputs.filter(output => !output.ownAddress), [tx.outputs]);

  const operationsCerts = useOperations(
    tx.certificates,
    isStakeRegistered,
    stakeKeyDeposit,
    primaryTokenInfo,
    operations,
    drepID
  );
  const warningComp = useWarningSection({ warning: operations, title: strings.attentionLabel, content: strings.rewardsWithdraw });

  const { plate } = selected;
  const currentWalletIcon = <WalletAccountIcon iconSeed={plate.ImagePart} saturationFactor={0} size={8} scalePx={4} />;

  const waletInfoDisplay = (
    <Stack
      direction="row"
      alignItems="center"
      gap="8px"
      sx={{
        '& canvas': {
          borderRadius: '4px',
        },
      }}
    >
      {currentWalletIcon}
      <Box
        component="button"
        onClick={() => {
          changeModalView({ modalView: 'walletInfo', title: 'Wallet Details' });
        }}
        id={commonIdPath + '-walletInfo-button'}
      >
        <Typography
          variant="body1"
          color="ds.text_primary_medium"
          fontWeight={500}
          id={commonIdPath + '-walletNameAndPlate-text'}
        >
          {`${truncateLongName(selectedWalletName, 29)} | ${plate.TextPart}`}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Stack sx={{ padding: '24px' }}>
      {warningComp ? warningComp : <></>}
      <Stack direction="column" gap="8px" mt={warningComp ? '24px' : '0px'}>
        <InfoInline label="Wallet" value={waletInfoDisplay} />
        {/* <InfoInline label="Connected to" value="dapp" /> */}
        <InfoInline
          label="Fee"
          value={`-${new BigNumber(tx.fee.rawQuantity).shiftedBy(-primaryTokenInfo.decimals)} ${primaryTokenInfo.name}`}
        />
      </Stack>

      <Divider sx={{ margin: '24px 0px' }} />

      <MyWalletSection tx={tx} stakingAddress={stakingAddress} notOwnedOutputs={notOwnedOutputs} operationFee={operationsCerts} />

      {notOwnedOutputs?.length === 1 && (
        <ExternalPartySection receiverCustomTitle={receiverCustomTitle} output={notOwnedOutputs[0]} />
      )}

      {extraOverviewDetails && <WalletExtraDetails extraDetails={extraOverviewDetails} />}

      {(operationsCerts?.components.length > 0 || operations?.components?.length > 0) && (
        <OperationsSection operations={operationsCerts?.components.length > 0 ? operationsCerts : operations} />
      )}
    </Stack>
  );
};

const InfoInline = ({ label, value }) => {
  const isText = typeof value === 'string' || typeof value === 'number';

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body1" color="ds.text_gray_low">
        {label}
      </Typography>
      {isText ? (
        <Typography variant="body1" color="ds.text_gray_medium" id={commonIdPath + '-info' + label + '-text'}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Stack>
  );
};

const MyWalletSection = ({ tx, stakingAddress, notOwnedOutputs, operationFee }) => {
  const strings = useStrings();
  return (
    <Box>
      <Collapsible
        expanded={true}
        title={strings.yourWallet}
        content={
          <Stack gap="12px">
            <CopyableText value={stakingAddress}>
              <Typography id={commonIdPath + ':yourAddress-truncatedAddress-text'}>{truncateAddress(stakingAddress)}</Typography>
            </CopyableText>
            <MyWalletTokens tx={tx} notOwnedOutputs={notOwnedOutputs} operationFee={operationFee} />
          </Stack>
        }
      />
    </Box>
  );
};

const ExternalPartySection = ({ receiverCustomTitle, output }) => {
  const address = output?.rewardAddress ?? output?.address ?? '-';
  const strings = useStrings();

  return (
    <>
      <Stack mt="16px" direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
          {strings.addressToLabel}:
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium" id={commonIdPath + ':to-receiver-text'}>
          {receiverCustomTitle?.to ?? <CopyableText value={address}>{truncateAddressShort(address, 40)}</CopyableText>}
        </Typography>
      </Stack>

      {receiverCustomTitle?.associatedAddress && (
        <Stack mt="8px" direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
            {strings.associatedAddress}
          </Typography>
          <Typography variant="body1" color="ds.text_gray_medium" id={commonIdPath + ':associatedAddress-truncatedAddress-text'}>
            {<CopyableText value={address}>{truncateAddressShort(address, 25)}</CopyableText>}
          </Typography>
        </Stack>
      )}
    </>
  );
};

const OperationsSection = ({ operations }) => {
  const strings = useStrings();
  const componentsNotDuplicated = operations?.components
    .filter(component => !component.duplicated)
    .map(({ component }) => component);

  return (
    <Box>
      <Divider sx={{ margin: '24px 0px' }} />

      <Collapsible
        expanded={true}
        title={strings.operations}
        content={
          <Box>
            {componentsNotDuplicated.map((operation, index) => (
              <React.Fragment key={operation.key || index}>{operation}</React.Fragment>
            ))}
          </Box>
        }
      />
    </Box>
  );
};

const MyWalletTokens = ({ tx, notOwnedOutputs, operationFee }) => {
  const strings = useStrings();
  const { primaryTokenInfo, operations, stakeKeyDeposit, stakingRewards } = useTxReviewModal();
  const isReceiving = operations?.kind === 'undelegate';
  const undelegateOperation = operations?.kind === 'undelegate';

  const totalPrimaryTokenSent = React.useMemo(
    () =>
      notOwnedOutputs
        .flatMap(output => output.assets.filter(asset => asset.tokenInfo.nature === Portfolio.Token.Nature.Primary))
        .reduce((previous, current) => Quantities.sum([previous, current.quantity]), Quantities.zero),
    [notOwnedOutputs]
  );

  const totalPrimaryTokenSpent = React.useMemo(
    () => Quantities.sum([totalPrimaryTokenSent, tx.fee.quantity, operationFee.totalFee]),
    [totalPrimaryTokenSent, tx.fee.quantity, operationFee]
  );

  const notPrimaryTokenSent = React.useMemo(
    () =>
      notOwnedOutputs.flatMap(output => output.assets.filter(asset => asset.tokenInfo.nature !== Portfolio.Token.Nature.Primary)),
    [notOwnedOutputs]
  );
  const formatedFee = new BigNumber(totalPrimaryTokenSpent).shiftedBy(-primaryTokenInfo.decimals).toString();
  const undelegateFee = Quantities.diff(stakeKeyDeposit, totalPrimaryTokenSpent);
  const undelegateFormatedFee = new BigNumber(Quantities.diff(undelegateFee, stakingRewards))
    .shiftedBy(-primaryTokenInfo.decimals)
    .toString();

  return (
    <Stack direction="row" sx={{ display: 'flex', flexWrap: 'wrap' }} gap="8px">
      <Stack direction="row" justifyContent="space-between" width="100%" alignItems="flex-start">
        <Stack direction="row" gap="4px" alignItems="flex-start">
          <IconWrapper receive={isReceiving}>{isReceiving ? <Icon.Receive /> : <Icon.Send />}</IconWrapper>
          <Typography fontWeight="500">{isReceiving ? strings.receiveLabel : strings.sendLabel}</Typography>
        </Stack>
        <Stack direction="row" gap="8px" justifyContent="flex-end" flexWrap="wrap">
          <Box
            sx={{
              padding: '4px 12px',
              backgroundColor: isReceiving ? 'ds.secondary_300' : 'ds.primary_500',
              borderRadius: '8px',
              flexWrap: 'nowrap',
              ml: '40px',
            }}
          >
            <Typography color={isReceiving ? 'ds.text_gray_max' : 'ds.white_static'} id={commonIdPath + '-txSendAmount-text'}>
              {undelegateOperation ? undelegateFormatedFee : formatedFee} {primaryTokenInfo.name}
            </Typography>
          </Box>
          {notPrimaryTokenSent.length > 0 &&
            notPrimaryTokenSent.map(item => {
              const decimals = item.tokenInfo.info.numberOfDecimals;

              return (
                <Box sx={{ padding: '4px 12px', backgroundColor: 'ds.primary_100', borderRadius: '8px', flexWrap: 'nowrap' }}>
                  <Typography color="ds.text_primary_medium">
                    {new BigNumber(item.quantity).shiftedBy(-decimals).toString()} {item.tokenInfo.info.name}
                  </Typography>
                </Box>
              );
            })}
        </Stack>
      </Stack>
    </Stack>
  );
};

const WalletExtraDetails = ({ extraDetails }) => {
  return (
    <Box component="button" width="100%" mt="24px" onClick={extraDetails.onClick}>
      <Typography fontWeight="500" color="ds.text_primary_medium" textAlign="right">
        {extraDetails.title}
      </Typography>
    </Box>
  );
};
