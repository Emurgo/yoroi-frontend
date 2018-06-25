// @flow
import ExtendableError from 'es6-error';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  unknowError: {
    id: 'app.errors.unknowError',
    defaultMessage: '!!!Unknow error.',
    description: 'Unknow error message.'
  },
});

class LocalizableError extends ExtendableError {
  constructor(
    { id, defaultMessage, values = {} }:
    { id: string, defaultMessage: string, values?: Object}
  ) {
    if (!id) throw new Error('id:string is required.');
    if (!defaultMessage) throw new Error('defaultMessage:string is required.');
    super(`${id}: ${JSON.stringify(values)}`);
    this.id = id;
    this.defaultMessage = defaultMessage;
    this.values = values;
  }
}

class UnknowError extends LocalizableError {
  constructor() {
    super({
      id: messages.unknowError.id,
      defaultMessage: messages.unknowError.defaultMessage,
    });
  }
}

export function localizedError(error: any): LocalizableError {
  if (error instanceof LocalizableError) {
    return error;
  }
  return new UnknowError();
}

export default LocalizableError;
