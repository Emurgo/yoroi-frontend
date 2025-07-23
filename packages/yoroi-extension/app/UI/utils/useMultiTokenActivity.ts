import { Portfolio } from '@yoroi/types';
import { useQuery, UseQueryResult } from 'react-query';

interface ApiError {
  message: string;
  statusCode: number;
}

export const useMultiTokenActivity = (
  tokenIds: string[],
  interval: '24h' | '7d' | '30d',
  backend: string
): UseQueryResult<Portfolio.Api.TokenActivityResponse, ApiError> => {
  const fetchTokenActivity = async (): Promise<Portfolio.Api.TokenActivityResponse> => {
    const response = await fetch(`${backend}/tokens/activity/multi/${interval}`, {
      method: 'POST',
      body: JSON.stringify(tokenIds),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    if (response.ok) {
      return await response.json();
    }
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData;
    } catch (e) {
      errorMessage = response.statusText || `Request failed with status ${response.status}`;
    }

    throw {
      message: errorMessage,
      statusCode: response.status,
    };
  };

  return useQuery<Portfolio.Api.TokenActivityResponse, ApiError>(['multiTokenActivity', tokenIds, interval], fetchTokenActivity, {
    enabled: tokenIds.length > 0, // Fetch only if there are token IDs provided
    staleTime: 60000, // Cache remains fresh for 1 minute
    cacheTime: 300000, // Cache remains in memory for 5 minutes
    refetchOnWindowFocus: false, // Prevents refetching when the window gains focus
  });
};
