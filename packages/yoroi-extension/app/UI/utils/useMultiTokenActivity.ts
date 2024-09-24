import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from 'react-query';

interface TokenActivityResponse {
  [key: string]: any;
}

interface ApiError {
  message: string;
  statusCode: number;
}

export const useMultiTokenActivity = (
  interval: '24h' | '1w' | '1m'
): UseMutationResult<TokenActivityResponse, AxiosError<ApiError>, string[]> => {
  const postTokenActivity = async (tokenIds: string[]): Promise<TokenActivityResponse> => {
    const response = await axios.post(`https://zero.yoroiwallet.com/tokens/activity/multi/${interval}`, tokenIds, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    console.log('tokenActivityresponse', { interval, response });
    return response.data;
  };

  return useMutation(postTokenActivity);
};
