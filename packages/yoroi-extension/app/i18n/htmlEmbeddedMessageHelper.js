// @flow
type TagFormatter = Function;

export const strong: TagFormatter = chunks => (<strong>{chunks}</strong>);

export const makeLink: string => TagFormatter = href => chunks => (
  <a target="_blank" rel="noopener noreferrer" href={href}>
    {chunks}
  </a>
);

export const em: TagFormatter = chunks => (<em>{chunks}</em>);
