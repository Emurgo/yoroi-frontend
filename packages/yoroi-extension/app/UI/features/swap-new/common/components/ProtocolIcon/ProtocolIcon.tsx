import {getDexByProtocol} from '@yoroi/swap'
import {Swap} from '@yoroi/types'

import * as React from 'react'
import { Icon } from '../../../../../components'


type Props = {
  protocol: Swap.Protocol
  size: number
}

export const ProtocolIcon = ({protocol, size}: Props) => {
  const IconVariant = icons[getDexByProtocol(protocol)] ?? Icon.Swap
  return <IconVariant size={size} />
}

const icons: Record<Swap.Dex, React.FunctionComponent<{size?: number}>> = {
  [Swap.Dex.Muesliswap]: Icon.MuesliSwap,
  [Swap.Dex.Minswap]: Icon.MinSwap,
  [Swap.Dex.Spectrum]: Icon.SpectrumSwap,
  [Swap.Dex.Teddy]: Icon.Swap,
  [Swap.Dex.Wingriders]: Icon.WingRiders,
  [Swap.Dex.Vyfi]: Icon.VyfiSwap,
  [Swap.Dex.Sundaeswap]: Icon.SundaeSwap,
  [Swap.Dex.Splash]: Icon.Swap,
  // @ts-ignore
  [Swap.Dex.Cswap]: Icon.Cswap,
  [Swap.Dex.Unsupported]: Icon.Swap,
} as const
