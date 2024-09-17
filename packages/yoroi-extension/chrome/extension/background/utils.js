// @flow
import LocalStorageApi from '../../../app/api/localStorage/index';
import { environment } from '../../../app/environment';
import type { IFetcher } from '../../../app/api/ada/lib/state-fetch/IFetcher.types';
import { RemoteFetcher } from '../../../app/api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../../app/api/ada/lib/state-fetch/batchedFetcher';
import type { IFetcher as IFetcherCommon } from '../../../app/api/common/lib/state-fetch/IFetcher.types';
import { RemoteFetcher as RemoteFetcherCommon } from '../../../app/api/common/lib/state-fetch/remoteFetcher';
import { BatchedFetcher as BatchedFetcherCommon } from '../../../app/api/common/lib/state-fetch/batchedFetcher';

async function createFetcher(
  fetcherType: Function,
  localStorageApi: LocalStorageApi,
): * {
  const locale = await localStorageApi.getUserLocale() ?? 'en-US';
  return new fetcherType(
    () => environment.getVersion(),
    () => locale,
    () => {
      if (environment.userAgentInfo.isFirefox()) {
        return 'firefox';
      }
      if (environment.userAgentInfo.isChrome()) {
        return 'chrome';
      }
      return '-';
    },
  )
}

export async function getCardanoStateFetcher(
  localStorageApi: LocalStorageApi = new LocalStorageApi(),
): Promise<IFetcher> {
  return new BatchedFetcher(await createFetcher(RemoteFetcher, localStorageApi));
}

export async function getCommonStateFetcher(): Promise<IFetcherCommon> {
  const locale = await (new LocalStorageApi()).getUserLocale() ?? 'en-US';
  return new BatchedFetcherCommon(new RemoteFetcherCommon(
    () => environment.getVersion(),
    () => locale,
    () => {
      if (environment.userAgentInfo.isFirefox()) {
        return 'firefox';
      }
      if (environment.userAgentInfo.isChrome()) {
        return 'chrome';
      }
      return '-';
    },
  ))
}
