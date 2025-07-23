import { useYoroiRemoteConfig } from '../hooks/useYoroiRemoteConfig'

export const withYoroiRemoteConfig = (WrappedComponent: any) => {
  return function Wrapper(props: any) {
    const queryResult = useYoroiRemoteConfig()
    return <WrappedComponent {...props} yoroiRemoteConfigQuery={queryResult} />
  }
}