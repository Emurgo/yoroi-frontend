// @flow
type HandlerFuncType<RequestType, ResponseType> = (
  RequestType
) => Promise<ResponseType>

export type HandlerType<RequestType, ResponseType, AdditionalMixins = {| |}> = {|
  typeTag: string,
  handle: HandlerFuncType<RequestType, ResponseType>,
  ...AdditionalMixins,
|};
