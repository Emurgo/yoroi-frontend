// @flow
import ExtendableError from 'es6-error';
import { defineMessages } from 'react-intl';

import type { MessageDescriptor } from 'react-intl';

const messages = defineMessages({
  unknownError: {
    id: 'app.errors.unknowError',
    defaultMessage: '!!!Unknown error occurred. Please retry.',
  },
  unexpectedError: {
    id: 'app.errors.unexpectedError',
    defaultMessage: '!!!Unexpected error occurred. Please retry.',
  },
});

// Base class to allow wrapping a localizable message into an ES6-error
class LocalizableError extends ExtendableError {

  id: string;
  defaultMessage: string | null;
  values: Object;

  constructor(
    { id, defaultMessage, values }:
    {|
      ...$Exact<MessageDescriptor>,
      values?: Object,
    |}
  ) {
    if (!id) throw new Error('id:string is required.');
    if (defaultMessage == null) throw new Error('defaultMessage:string is required.');
    const json = values === undefined ? 'undefined' : JSON.stringify(values);
    super(`${id}: ${json}`);
    this.id = id;
    this.defaultMessage = defaultMessage;
    this.values = values || {};
  }
}

// We are only supposed to throw LocalizableError
// We use this as a fallback in case of programmer error
class UnknownError extends LocalizableError {
  constructor() {
    super({
      id: messages.unknownError.id,
      defaultMessage: messages.unknownError.defaultMessage || '',
    });
  }
}

export class UnexpectedError extends LocalizableError {
  constructor() {
    super({
      id: messages.unexpectedError.id,
      defaultMessage: messages.unexpectedError.defaultMessage || '',
    });
  }
}

export function localizedError(error: Error): LocalizableError {
  if (error instanceof LocalizableError) {
    return error;
  }
  return new UnknownError();
}

export default LocalizableError;
