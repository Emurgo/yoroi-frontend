// @flow
export const submitOnEnter = <ArgsT, HTMLElementT: EventTarget>
  (action: ArgsT=>void, event: SyntheticKeyboardEvent<HTMLElementT>, ...args: Array<ArgsT>) => {
  event.persist && event.persist();
  event.key === 'Enter' && action.apply(this, args);
};
