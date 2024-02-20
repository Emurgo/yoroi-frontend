// @flow
export const submitOnEnter = <ArgsT, HTMLElementT: EventTarget>
  (action: ArgsT=>void, event: SyntheticKeyboardEvent<HTMLElementT>, ...args: Array<ArgsT>) => {
  if (event.persist != null) event.persist();
  if (event.key === 'Enter') action.apply(this, args);
};
