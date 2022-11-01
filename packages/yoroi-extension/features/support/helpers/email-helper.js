// @flow

import axios from 'axios';
import {
  defaultRepeatPeriod,
  defaultWaitTimeout,
  mailsacAPIKey,
  mailsacEmail,
  mailsacRequestMainPart
} from './common-constants';
import * as helpers from './helpers';

type EmailRequestType =
  'all' |
  'getLast' |
  'count' |
  'deleteAll' |
  'deleteById' |
  'check' |
  'getMessageText';
type EmailRequest = {|
  method: string,
  url: string,
  headers: any,
|};

const _buildEmailRequest = (request: EmailRequestType, messageId?: string): EmailRequest => {
  switch (request) {
    case 'count':
      return {
        method: 'get',
        url: `${mailsacRequestMainPart}message-count`,
        headers: { 'Mailsac-Key': mailsacAPIKey },
      };
    case 'getLast':
      return {
        method: 'get',
        url: `${mailsacRequestMainPart}messages/${messageId}`,
        headers: { 'Mailsac-Key': mailsacAPIKey },
      };
    case 'deleteById':
      return {
        method: 'delete',
        url: `${mailsacRequestMainPart}messages/${messageId}`,
        headers: { 'Mailsac-Key': mailsacAPIKey },
      };
    case 'check':
      return {
        method: 'get',
        url: `https://mailsac.com/api/me`,
        headers: { 'Mailsac-Key': mailsacAPIKey },
      };
    case 'getMessageText':
      return {
        method: 'get',
        url: `https://mailsac.com/api/text/${mailsacEmail}/${messageId}`,
        headers: { 'Mailsac-Key': mailsacAPIKey },
      };
    default:
      return {
        method: 'get',
        url: `${mailsacRequestMainPart}messages`,
        headers: { 'Mailsac-Key': mailsacAPIKey },
      };
  }

};

export const getAllEmails = async (): Promise<any> => {
  const response = await axios(_buildEmailRequest('all'));

  return response.data;
};

export const getLastEmail = async (): Promise<any> => {
  const allMessages = await getAllEmails();

  return allMessages[0];
};

export const getEmailBody = async (messageId: string): Promise<any> => {
  const response = await axios(_buildEmailRequest('getMessageText', messageId));

  return response.data;
};

export const waitForNewEmail = async (
  timeout: number = defaultWaitTimeout,
  repeatPeriod: number = defaultRepeatPeriod
): Promise<any> => {
  const countRequest = _buildEmailRequest('count');
  const amountBefore = (await axios(countRequest)).data.count;
  let newAmount = 0;
  const endTime = Date.now() + timeout;

  while (endTime >= Date.now()) {
    newAmount = (await axios(countRequest)).data.count;
    if (amountBefore < newAmount) return true;
    await helpers.sleep(repeatPeriod);
  }
  throw new Error(`There is no new email after ${timeout / 1000} seconds. Emails in total: ${newAmount}`);
};

export const deleteAllEmails = async () => {
  const allMessages = await getAllEmails();
  for (const message of allMessages) {
    const messageId = message._id;
    await deleteEmail(messageId);
  }
};

export const deleteEmail = async (messageId) => {
  const response = await axios(_buildEmailRequest('deleteById', messageId));

  return response.data;
};

export const checkEmail = async () => {
  const response = await axios(_buildEmailRequest('check'));

  return response.data;
};