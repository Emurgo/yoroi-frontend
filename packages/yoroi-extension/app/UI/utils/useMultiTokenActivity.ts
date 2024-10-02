import { Portfolio } from '@yoroi/types';
import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from 'react-query';

interface ApiError {
  message: string;
  statusCode: number;
}

export const useMultiTokenActivity = (
  interval: '24h' | '7d' | '30d'
): UseMutationResult<Portfolio.Api.TokenActivityResponse, AxiosError<ApiError>, string[]> => {
  const postTokenActivity = async (tokenIds: string[]): Promise<Portfolio.Api.TokenActivityResponse> => {
    const response = await axios.post(`https://zero.yoroiwallet.com/tokens/activity/multi/${interval}`, tokenIds, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return response.data;
  };

  return useMutation(postTokenActivity);
};
