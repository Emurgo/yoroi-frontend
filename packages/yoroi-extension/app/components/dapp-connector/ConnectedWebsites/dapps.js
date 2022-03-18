// @flow
import { defineMessages } from 'react-intl'
import FiboLogo from '../../../assets/images/dapp-connector/fibo-logo-black.svg'
import SundaeSwapLogo from '../../../assets/images/dapp-connector/sundae-swap-logo-dark.png'
import AstarterLogo from '../../../assets/images/dapp-connector/a-starter-logo.svg'

const messages = defineMessages({
    fibo: {
        id: 'connector.webistes.dapps.fibo.name',
        defaultMessage: '!!!Fibo'
    },
    fiboDescription: {
        id: 'connector.webistes.dapps.fibo.description',
        defaultMessage: '!!!NFT marketplace that connects social conscious artists with buyers and sellers.'
    },
    sundaeswap: {
        id: 'connector.webistes.dapps.sundaeswap.name',
        defaultMessage: '!!!Sundaeswap',
    },
    sundaeswapDescription: {
        id: 'connector.webistes.dapps.sundaeswap.description',
        defaultMessage: '!!!Sentence of text about the dapp and its main features and benefits.',
    },
    astarter: {
        id: 'connector.webistes.dapps.astarter.name',
        defaultMessage: '!!!Astarter',
    },
    astarterDescription: {
        id: 'connector.webistes.dapps.astarter.description',
        defaultMessage: '!!!The DeFi infrastructure hub on Cardano, powering decentralized finance applications.',
    }
})

export const BRANDED_DAPPS = [
    {
        title: messages.fibo,
        description: messages.fiboDescription,
        url: 'https://fibo.art/',
        bgColor: '#F0F3F5',
        logo: <FiboLogo />
    },
    {
        title: messages.sundaeswap,
        description: messages.sundaeswapDescription,
        url: 'https://exchange.sundaeswap.finance/',
        bgColor: '#EDD9FF',
        logo: <SundaeSwapLogo />
    },
    {
        title: messages.astarter,
        description: messages.astarterDescription,
        url: 'https://astarter.io/',
        bgColor: '##F0F3F5',
        logo: <AstarterLogo />
    },
]