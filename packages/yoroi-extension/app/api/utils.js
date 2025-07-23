// @flow
export function makeTimeoutAbortSignal(timeout: number): AbortSignal {
  // $FlowIgnore[prop-missing] newer API than outdated flow
  return AbortSignal.timeout(timeout);
}

type ServerErrorResponse = {|
  status: number,
  data: string,
|};

export class ServerError extends Error {
  response: ServerErrorResponse;

  constructor(response: ServerErrorResponse) {
    super(`server returns ${response.status}`);
    // Maintains proper stack trace for where our error was thrown (non-standard)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }
    this.response = response;
  }
}

export const fetchAndEnsureSuccess: typeof fetch = (...args): ReturnType<typeof fetch> =>  {
  return fetch(...args).then(resp => {
    if (resp.ok) {
      return resp;
    }
    return resp.text().then(data => {
      throw new ServerError({ status: resp.status, data });
    })
  });
}

