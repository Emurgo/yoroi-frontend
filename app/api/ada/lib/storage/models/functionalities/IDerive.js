// @flow


export class IDerive<Request, Result> {
  forwardFunc: <Insert: {}>(
    body: Request,
    levelSpecific: Insert,
  ) => Promise<Result>;

  constructor(forwardFunc: <Insert: {}>(
    body: Request,
    levelSpecific: Insert,
  ) => Promise<Result>) {
    this.forwardFunc = forwardFunc;
  }
  derive<Insert: {}>(
    body: Request,
    levelSpecific: Insert,
  ): Promise<Result> {
    return this.forwardFunc<Insert>(
      body,
      levelSpecific
    );
  }
}
