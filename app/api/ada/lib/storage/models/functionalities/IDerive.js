// @flow

export class IDerive<Request, Result> {
  forwardFunc: (body: Request) => Promise<Result>;

  constructor(forwardFunc: (body: Request) => Promise<Result>) {
    this.forwardFunc = forwardFunc;
  }
  derive(body: Request): Promise<Result> {
    return this.forwardFunc(body);
  }
}
