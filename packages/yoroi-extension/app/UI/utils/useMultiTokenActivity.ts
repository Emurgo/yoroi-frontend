import { Portfolio } from '@yoroi/types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

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

  return useQuery<Portfolio.Api.TokenActivityResponse, ApiError>({
    queryKey: ['multiTokenActivity', tokenIds, interval],
    queryFn: fetchTokenActivity,
    enabled: tokenIds.length > 0, // Fetch only if there are token IDs provided
    staleTime: 60_000, // Cache remains fresh for 1 minute
    gcTime: 300_000, // v5: cacheTime -> gcTime (5 minutes)
    refetchOnWindowFocus: false, // Prevents refetching when the window gains focus
  });
};
