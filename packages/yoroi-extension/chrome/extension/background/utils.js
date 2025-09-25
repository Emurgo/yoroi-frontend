// @flow
import LocalStorageApi from '../../../app/api/localStorage/index';
import { environment } from '../../../app/environment';
import type { IFetcher } from '../../../app/api/ada/lib/state-fetch/IFetcher.types';
import { RemoteFetcher } from '../../../app/api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../../app/api/ada/lib/state-fetch/batchedFetcher';
import type { IFetcher as IFetcherCommon } from '../../../app/api/common/lib/state-fetch/IFetcher.types';
import { RemoteFetcher as RemoteFetcherCommon } from '../../../app/api/common/lib/state-fetch/remoteFetcher';
import { BatchedFetcher as BatchedFetcherCommon } from '../../../app/api/common/lib/state-fetch/batchedFetcher';

declare var chrome;

async function createFetcher(fetcherType: Function, localStorageApi: LocalStorageApi): * {
  const locale = (await localStorageApi.getUserLocale()) ?? 'en-US';
  return new fetcherType(
    () => environment.getVersion(),
    () => locale,
    () => {
      if (environment.isFirefox()) {
        return 'firefox';
      }
      if (environment.isChrome()) {
        return 'chrome';
      }
      return '-';
    }
  );
}

export async function getCardanoStateFetcher(localStorageApi: LocalStorageApi = new LocalStorageApi()): Promise<IFetcher> {
  return new BatchedFetcher(await createFetcher(RemoteFetcher, localStorageApi));
}

export async function getCommonStateFetcher(): Promise<IFetcherCommon> {
  const locale = (await new LocalStorageApi().getUserLocale()) ?? 'en-US';
  return new BatchedFetcherCommon(
    new RemoteFetcherCommon(
      () => environment.getVersion(),
      () => locale,
      () => {
        if (environment.isFirefox()) {
          return 'firefox';
        }
        if (environment.isChrome()) {
          return 'chrome';
        }
        return '-';
      }
    )
  );
}

export function sendLongMessage(toTabId: number, message: string, messageType: string, messageId: string, maxChunkSize: number) {
  const chunkCount = Math.ceil(message.length / maxChunkSize);
  for (let i = 0; i < chunkCount; i++) {
    const nextChunk = message.slice(i * maxChunkSize, (i + 1) * maxChunkSize);
    chrome.tabs.sendMessage(toTabId, { type: messageType, id: messageId, chunk: nextChunk, chunkIndex: i, chunkCount });
  }
}
