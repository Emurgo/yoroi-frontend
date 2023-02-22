// @flow
import type { Node, ComponentType } from 'react';
import InfoDialog from '../../widgets/infoDialog';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { Typography, Box } from '@mui/material';

const messages: Object = defineMessages({
    title: {
        id: 'wallet.create.tips.title',
        defaultMessage: '!!!Read this before saving your recovery phrase',
    },
    firstTip: {
        id: 'wallet.create.tips.first',
        defaultMessage: '!!!DO NOT share the recovery phrase as this will allow anyone to access your assets and wallet.',
    },
    secondTip: {
        id: 'wallet.create.tips.second',
        defaultMessage: '!!!The recovery phrase is the only way to access your wallet.',
    },
    thirdTip: {
        id: 'wallet.create.tips.third',
        defaultMessage: '!!!Yoroi will NEVER ask for the recovery phrase. Watch out for scammers and impersonators.',
    },
    forthTip: {
        id: 'wallet.create.tips.forth',
        defaultMessage: '!!!If you lose your recovery phrase, it will not be possible to recover your wallet.',
    },
    fifthTip: {
        id: 'wallet.create.tips.fifth',
        defaultMessage: '!!!Remember: you are the only person who should know this recovery phrase.',
    },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
    open: boolean,
    onClose(): void,
|}

function CreateWalletPage(props: Props & Intl): Node {
    const { open, onClose, intl } = props;

    const tips = [
        messages.firstTip,
        messages.secondTip,
        messages.thirdTip,
        messages.forthTip,
        messages.fifthTip,
    ];

    return (
      <InfoDialog open={open} onClose={onClose}>
        <Typography>{intl.formatMessage(messages.title)}</Typography>
        <Box component='ul'>
          {tips.map(tip => (
            <Box component='li'>{intl.formatMessage(tip)}</Box>
          ))}
        </Box>
      </InfoDialog>
    )
}

export default (injectIntl(CreateWalletPage): ComponentType<Props>);