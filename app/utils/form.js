// @flow
export const submitOnEnter = (action: any, ...args: any) => {
  const event = args.pop();
  event.persist && event.persist();
  event.key === 'Enter' && action.apply(this, args);
};
