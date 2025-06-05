import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useMutation, useQuery, useQueryClient} from 'react-query'
import {Chain, Portfolio} from '@yoroi/types'
import { buildPortfolioTokenManagers } from '../helpers/build-token-manager'


const {tokenManagers} = buildPortfolioTokenManagers()


export const usePortfolioImageInvalidate = () => {
  const tokenManager = tokenManagers[Chain.Network.Mainnet] 


  const mutation = useMutation({
    mutationFn: async (ids: Array<Portfolio.Token.Id>) => {
        await tokenManager.api.tokenImageInvalidate(ids)

      // On web: simulate cache invalidation using unique URLs (timestamp)
      ids.forEach((id) => {
        const img = new Image()
        img.src = `${window.location.origin}/invalidate?token=${id}&ts=${Date.now()}`
      })
    },
  })

  return {
    ...mutation,
    invalidate: mutation.mutate,
  }
}

/* -----------------------------------------------
 * Portfolio Image Fetch Hook (Web-compatible)
 * --------------------------------------------- */

const supportedTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/svg',
  'image/tiff',
]

const supportedSizes = [64, 128, 256, 512, 720] as const

const getClosestSize = (size: number | string) => {
  const n = Number(size)
  return supportedSizes.find((s) => n <= s) ?? supportedSizes.at(-1)
}

type NativeAssetImageRequest = {
  policy: string
  name: string
  width: string | number
  height: string | number
  mediaType?: string
  contentFit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
  kind?: 'logo' | 'metadata'
}

export const usePortfolioImage = ({
  policy,
  name,
  width: _width,
  height: _height,
  mediaType: _mediaType = 'image/webp',
  contentFit = 'cover',
  kind = 'metadata',
}: NativeAssetImageRequest) => {
  const {invalidate} = usePortfolioImageInvalidate()
  const queryClient = useQueryClient()
  const network=Chain.Network.Mainnet // Assuming Mainnet for simplicity, adjust as needed

  const width = getClosestSize(_width)
  const height = getClosestSize(_height)
  const mediaType = _mediaType.toLowerCase()
  const isMediaTypeSupported = supportedTypes.includes(mediaType)
  const mimeType = mediaType === 'image/gif' ? 'image/gif' : 'image/webp'

  const headers = useMemo(() => ({Accept: mimeType}), [mimeType])
  const [isError, setError] = useState(false)
  const [isLoading, setLoading] = useState(true)

  const queryKey = ['native-asset-img', policy, name, `${width}x${height}`, contentFit]

  const query = useQuery({
    enabled: isMediaTypeSupported,
    staleTime: Infinity,
    queryKey,
    queryFn: () => {
      const count = queryClient.getQueryState(queryKey)?.dataUpdateCount
      const cache = count ? `&cache=${count}` : ''
      const url = `https://${network}.processed-media.yoroiwallet.com/${policy}/${name}?width=${width}&height=${height}&kind=${kind}&fit=${contentFit}${cache}`
        
      setLoading(true)
      return url
    },
  })

  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const onError = useCallback(() => {
    const count = queryClient.getQueryState(queryKey)?.dataUpdateCount
    if (count && count < 10) {
      timerRef.current = setTimeout(() => query.refetch(), count * 300)
    } else {
    //   if (isDev) {
    //     invalidate([`${policy}.${name}`])
    //     queryClient.invalidateQueries(queryKey)
    //   }
      setError(true)
    }
  }, [invalidate, policy, name, queryKey, query, queryClient])

  const onLoad = useCallback(() => {
    setLoading(false)
  }, [])

  return {
    uri: query.data,
    headers,
    isError: isError || query.isError,
    isLoading: isLoading || query.isLoading,
    crossOrigin: 'anonymous' as const,

    onError,
    onLoad,
  };
}
