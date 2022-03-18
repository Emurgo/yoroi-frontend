// @flow
import { defineMessages } from 'react-intl'
import FiboLogo from '../../../assets/images/dapp-connector/fibo-logo-black.inline.svg'
import SundaeSwapLogo from '../../../assets/images/dapp-connector/sundae-swap-logo-dark.inline.png'
import AstarterLogo from '../../../assets/images/dapp-connector/a-starter-logo.inline.svg'

const messages = defineMessages({
    fibo: {
        id: 'connector.connectedwebsites.dapps.fibo.name',
        defaultMessage: '!!!Fibo'
    },
    fiboDescription: {
        id: 'connector.connectedwebsites.dapps.fibo.description',
        defaultMessage: '!!!NFT marketplace that connects social conscious artists with buyers and sellers.'
    },
    sundaeswap: {
        id: 'connector.connectedwebsites.dapps.sundaeswap.name',
        defaultMessage: '!!!Sundaeswap',
    },
    sundaeswapDescription: {
        id: 'connector.connectedwebsites.dapps.sundaeswap.description',
        defaultMessage: '!!!Sentence of text about the dapp and its main features and benefits.',
    },
    astarter: {
        id: 'connector.connectedwebsites.dapps.astarter.name',
        defaultMessage: '!!!Astarter',
    },
    astarterDescription: {
        id: 'connector.connectedwebsites.dapps.astarter.description',
        defaultMessage: '!!!The DeFi infrastructure hub on Cardano, powering decentralized finance applications.',
    }
})

export const BRANDED_DAPPS = [
    {
        id: 1,
        name: messages.fibo,
        description: messages.fiboDescription,
        url: 'https://fibo.art/',
        bgColor: '#F0F3F5',
        logo: <FiboLogo />
    },
    {
        id: 2,
        name: messages.sundaeswap,
        description: messages.sundaeswapDescription,
        url: 'https://exchange.sundaeswap.finance/',
        bgColor: '#EDD9FF',
        logo: <SundaeSwapLogo />
    },
    {
        id: 3,
        name: messages.astarter,
        description: messages.astarterDescription,
        url: 'https://astarter.io/',
        bgColor: '##F0F3F5',
        logo: <AstarterLogo />
    },
]