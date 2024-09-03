import { freeze } from 'immer';
import { QueryClient } from 'react-query';

const queryClient = new QueryClient();
const keyToPersist = 'persist';
/*
const queryPersistorStorageKey = 'react-query-persistor'
const queryPersistorStorage: Persistor = {
  persistClient: async (client: PersistedClient) => {
    try {
      const filteredState: DehydratedState = {
        mutations: client.clientState.mutations,
        queries: client.clientState.queries.filter((query) => query.queryKey[0] === keyToPersist),
      }
      const filteredClient: PersistedClient = {
        ...client,
        clientState: filteredState,
      }
      await rootStorage.setItem(queryPersistorStorageKey, JSON.stringify(filteredClient))
    } catch (error) {
      logger.error('ReactQueryPersistor: Error saving data to AsyncStorage')
    }
  },
  restoreClient: async () => {
    try {
      const data = await rootStorage.getItem(queryPersistorStorageKey)
      return data != null ? JSON.parse(data as never) : undefined
    } catch (error) {
      logger.error('ReactQueryPersistor: Error restoring data to AsyncStorage')
      return undefined
    }
  },
  removeClient: async () => {
    try {
      await rootStorage.removeItem(queryPersistorStorageKey)
    } catch (error) {
      logger.error('ReactQueryPersistor: Error removing data to AsyncStorage')
    }
  },
}
/* Persistor disabled: experimental hitting IO too much
persistQueryClient({
  queryClient,
  persistor: queryPersistorStorage,
  maxAge: 24 * 60 * 60 * 1000, // Optional, set the maximum age of persisted queries (in milliseconds)
})
*/
export const queryInfo = freeze({ keyToPersist, queryClient });
